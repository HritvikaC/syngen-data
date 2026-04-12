"""
parser.py - Parses raw SQL CREATE TABLE statements into structured metadata.

Supports:
  - INT / INTEGER / BIGINT / SMALLINT / TINYINT
  - VARCHAR(n) / CHAR(n) / TEXT
  - FLOAT / DOUBLE / DECIMAL / NUMERIC / REAL
  - BOOLEAN / BOOL
  - DATE / DATETIME / TIMESTAMP
  - PRIMARY KEY (inline and table-level)
  - FOREIGN KEY … REFERENCES …
"""

import re
from typing import Optional

from models import ColumnSchema, ForeignKeySchema, ParsedSchema, TableSchema

# ---------------------------------------------------------------------------
# Type normalisation map
# ---------------------------------------------------------------------------
_TYPE_MAP: dict[str, str] = {
    "int": "INT",
    "integer": "INT",
    "bigint": "INT",
    "smallint": "INT",
    "tinyint": "INT",
    "mediumint": "INT",
    "float": "FLOAT",
    "double": "FLOAT",
    "real": "FLOAT",
    "decimal": "FLOAT",
    "numeric": "FLOAT",
    "varchar": "VARCHAR",
    "char": "VARCHAR",
    "text": "TEXT",
    "longtext": "TEXT",
    "mediumtext": "TEXT",
    "tinytext": "TEXT",
    "boolean": "BOOLEAN",
    "bool": "BOOLEAN",
    "date": "DATE",
    "datetime": "DATETIME",
    "timestamp": "DATETIME",
    "json": "TEXT",
    "uuid": "UUID",
    "serial": "INT",
    "bigserial": "INT",
}

SUPPORTED_TYPES = set(_TYPE_MAP.values())


def _normalise_type(raw: str) -> tuple[str, Optional[int]]:
    """Return (normalised_type, length_or_None)."""
    raw = raw.strip().lower()
    # strip length e.g. varchar(100) → ('varchar', 100)
    m = re.match(r"(\w+)\s*\((\d+)(?:,\s*\d+)?\)", raw)
    if m:
        base, length = m.group(1), int(m.group(2))
    else:
        base, length = re.match(r"(\w+)", raw).group(1), None

    normalised = _TYPE_MAP.get(base)
    if normalised is None:
        raise ValueError(f"Unsupported data type: '{raw}'")
    return normalised, length


def parse_schema(sql: str) -> ParsedSchema:
    """
    Parse one or more CREATE TABLE statements and return a ParsedSchema.

    Raises ValueError with a descriptive message on bad input.
    """
    # Remove single-line and block SQL comments
    sql = re.sub(r"--[^\n]*", "", sql)
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)

    # Find all CREATE TABLE blocks
    pattern = re.compile(
        r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\((.*?)\)\s*;",
        re.IGNORECASE | re.DOTALL,
    )
    matches = pattern.findall(sql)

    if not matches:
        raise ValueError(
            "No valid CREATE TABLE statements found. "
            "Ensure each statement ends with a semicolon."
        )

    tables: list[TableSchema] = []

    for table_name, body in matches:
        columns: list[ColumnSchema] = []
        foreign_keys: list[ForeignKeySchema] = []
        table_level_pks: list[str] = []

        # Split body into individual clauses (handle nested parens in types)
        clauses = _split_clauses(body)

        for clause in clauses:
            clause = clause.strip()
            if not clause:
                continue

            upper = clause.upper()

            # ---- Table-level PRIMARY KEY ----
            if upper.startswith("PRIMARY KEY"):
                pk_cols = re.findall(r"`?(\w+)`?", clause.split("(", 1)[1])
                table_level_pks.extend(pk_cols)
                continue

            # ---- FOREIGN KEY ----
            if upper.startswith("FOREIGN KEY") or upper.startswith("CONSTRAINT"):
                fk = _parse_foreign_key(clause)
                if fk:
                    foreign_keys.append(fk)
                continue

            # ---- UNIQUE / INDEX / KEY (skip non-column clauses) ----
            if re.match(r"(UNIQUE|KEY|INDEX|CHECK)\b", upper):
                continue

            # ---- Column definition ----
            col = _parse_column(clause)
            if col:
                columns.append(col)

        # Merge table-level PKs into columns
        for col in columns:
            if col.name in table_level_pks:
                col.is_primary_key = True

        pk_list = [c.name for c in columns if c.is_primary_key]

        tables.append(
            TableSchema(
                name=table_name,
                columns=columns,
                primary_keys=pk_list,
                foreign_keys=foreign_keys,
            )
        )

    # Validate FK references
    table_names = {t.name.lower() for t in tables}
    for table in tables:
        for fk in table.foreign_keys:
            if fk.ref_table.lower() not in table_names:
                raise ValueError(
                    f"Foreign key in '{table.name}' references unknown table '{fk.ref_table}'."
                )

    return ParsedSchema(tables=tables)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _split_clauses(body: str) -> list[str]:
    """Split column definitions by comma, respecting parentheses."""
    clauses: list[str] = []
    depth = 0
    current: list[str] = []
    for ch in body:
        if ch == "(":
            depth += 1
            current.append(ch)
        elif ch == ")":
            depth -= 1
            current.append(ch)
        elif ch == "," and depth == 0:
            clauses.append("".join(current).strip())
            current = []
        else:
            current.append(ch)
    if current:
        clauses.append("".join(current).strip())
    return clauses


def _parse_column(clause: str) -> ColumnSchema | None:
    """Parse a single column definition clause."""
    # Match: `col_name` TYPE(len) [constraints…]
    m = re.match(
        r"`?(\w+)`?\s+([a-zA-Z]+(?:\s*\(\s*\d+(?:,\s*\d+)?\s*\))?)",
        clause,
    )
    if not m:
        return None

    col_name = m.group(1)
    raw_type = m.group(2).strip()

    try:
        norm_type, length = _normalise_type(raw_type)
    except ValueError:
        raise ValueError(f"Column '{col_name}': {raw_type!r} is not a supported type.")

    upper = clause.upper()
    is_pk = bool(re.search(r"\bPRIMARY\s+KEY\b", upper))
    is_nullable = not (
        bool(re.search(r"\bNOT\s+NULL\b", upper)) or is_pk
    )

    # Default value
    default = None
    dm = re.search(r"\bDEFAULT\s+([^\s,]+)", clause, re.IGNORECASE)
    if dm:
        default = dm.group(1).strip("'\"")

    return ColumnSchema(
        name=col_name,
        data_type=norm_type,
        raw_type=raw_type,
        length=length,
        is_primary_key=is_pk,
        is_nullable=is_nullable,
        default=default,
    )


def _parse_foreign_key(clause: str) -> ForeignKeySchema | None:
    """Parse a FOREIGN KEY … REFERENCES … clause."""
    m = re.search(
        r"FOREIGN\s+KEY\s*\(\s*`?(\w+)`?\s*\)\s*REFERENCES\s+`?(\w+)`?\s*\(\s*`?(\w+)`?\s*\)",
        clause,
        re.IGNORECASE,
    )
    if not m:
        return None
    return ForeignKeySchema(
        column=m.group(1),
        ref_table=m.group(2),
        ref_column=m.group(3),
    )
