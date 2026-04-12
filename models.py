"""
models.py - Pydantic data models and internal data structures for Syngen.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Schema representation (produced by parser.py)
# ---------------------------------------------------------------------------

class ColumnSchema(BaseModel):
    """Metadata for a single column."""
    name: str
    data_type: str                          # normalised: INT, VARCHAR, FLOAT, …
    raw_type: str                           # original string from SQL
    length: Optional[int] = None            # e.g. 100 in VARCHAR(100)
    is_primary_key: bool = False
    is_nullable: bool = True
    default: Optional[Any] = None


class ForeignKeySchema(BaseModel):
    """Represents a single FOREIGN KEY constraint."""
    column: str                             # local column
    ref_table: str                          # referenced table
    ref_column: str                         # referenced column in that table


class TableSchema(BaseModel):
    """Full metadata for one table."""
    name: str
    columns: list[ColumnSchema] = Field(default_factory=list)
    primary_keys: list[str] = Field(default_factory=list)
    foreign_keys: list[ForeignKeySchema] = Field(default_factory=list)


class ParsedSchema(BaseModel):
    """Top-level result returned by the parser."""
    tables: list[TableSchema] = Field(default_factory=list)

    def get_table(self, name: str) -> Optional[TableSchema]:
        for t in self.tables:
            if t.name.lower() == name.lower():
                return t
        return None

    def topological_order(self) -> list[str]:
        """Return table names sorted so referenced tables come first."""
        deps: dict[str, set[str]] = {t.name: set() for t in self.tables}
        for table in self.tables:
            for fk in table.foreign_keys:
                deps[table.name].add(fk.ref_table)

        ordered: list[str] = []
        visited: set[str] = set()

        def visit(name: str) -> None:
            if name in visited:
                return
            visited.add(name)
            for dep in deps.get(name, set()):
                visit(dep)
            ordered.append(name)

        for name in deps:
            visit(name)
        return ordered


# ---------------------------------------------------------------------------
# API request / response models
# ---------------------------------------------------------------------------

class UploadSchemaResponse(BaseModel):
    message: str
    tables: list[str]
    session_id: str


class GenerateRequest(BaseModel):
    session_id: str
    rows_per_table: int = Field(default=100, ge=1, le=100_000)
    # Optional per-table overrides: {"orders": 500, "users": 200}
    table_row_overrides: dict[str, int] = Field(default_factory=dict)


class GenerateResponse(BaseModel):
    message: str
    session_id: str
    tables_generated: list[str]
    row_counts: dict[str, int]


class ErrorResponse(BaseModel):
    detail: str
