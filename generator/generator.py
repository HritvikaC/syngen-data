"""
generator.py - Synthetic data generation engine for Syngen.

Generates realistic fake data using Faker + NumPy while honouring:
  - Data types (INT, VARCHAR, FLOAT, BOOLEAN, DATE, DATETIME, UUID, TEXT)
  - Primary key uniqueness
  - Foreign key referential integrity
  - Basic statistical distributions (age skewed, amounts log-normal, etc.)
  - Configurable field-level rules via FIELD_RULES
"""

import random
import uuid
from datetime import date, datetime, timedelta

import numpy as np
import pandas as pd
from faker import Faker

from models import ColumnSchema, ParsedSchema, TableSchema

faker = Faker()
Faker.seed(42)
np.random.seed(42)
random.seed(42)

# ---------------------------------------------------------------------------
# Field-level generation rules
# Matched against lower-cased column names (substring match).
# Each entry is a callable(n: int) -> list that generates n values.
# ---------------------------------------------------------------------------
FIELD_RULES: dict[str, callable] = {
    "email":        lambda n: [faker.unique.email() for _ in range(n)],
    "phone":        lambda n: [faker.phone_number() for _ in range(n)],
    "name":         lambda n: [faker.name() for _ in range(n)],
    "first_name":   lambda n: [faker.first_name() for _ in range(n)],
    "last_name":    lambda n: [faker.last_name() for _ in range(n)],
    "address":      lambda n: [faker.address().replace("\n", ", ") for _ in range(n)],
    "city":         lambda n: [faker.city() for _ in range(n)],
    "country":      lambda n: [faker.country() for _ in range(n)],
    "zip":          lambda n: [faker.zipcode() for _ in range(n)],
    "postal":       lambda n: [faker.postcode() for _ in range(n)],
    "company":      lambda n: [faker.company() for _ in range(n)],
    "url":          lambda n: [faker.url() for _ in range(n)],
    "username":     lambda n: [faker.user_name() for _ in range(n)],
    "password":     lambda n: [faker.password() for _ in range(n)],
    "description":  lambda n: [faker.text(max_nb_chars=200) for _ in range(n)],
    "title":        lambda n: [faker.sentence(nb_words=4) for _ in range(n)],
    "price":        lambda n: list(
                        np.round(np.random.lognormal(mean=3.5, sigma=1.2, size=n), 2)
                    ),
    "amount":       lambda n: list(
                        np.round(np.random.lognormal(mean=4.0, sigma=1.5, size=n), 2)
                    ),
    "salary":       lambda n: list(
                        np.round(np.random.normal(loc=55_000, scale=20_000, size=n)
                                 .clip(20_000, 300_000), 2)
                    ),
    "age":          lambda n: list(
                        np.random.normal(loc=35, scale=12, size=n)
                        .clip(18, 90).astype(int)
                    ),
    "rating":       lambda n: list(np.round(np.random.uniform(1, 5, n), 1)),
    "score":        lambda n: list(np.round(np.random.uniform(0, 100, n), 2)),
    "quantity":     lambda n: list(np.random.randint(1, 500, size=n)),
    "count":        lambda n: list(np.random.randint(0, 1000, size=n)),
    "lat":          lambda n: list(np.round(np.random.uniform(-90, 90, n), 6)),
    "lon":          lambda n: list(np.round(np.random.uniform(-180, 180, n), 6)),
    "longitude":    lambda n: list(np.round(np.random.uniform(-180, 180, n), 6)),
    "latitude":     lambda n: list(np.round(np.random.uniform(-90, 90, n), 6)),
    "status":       lambda n: [random.choice(
                        ["active", "inactive", "pending", "suspended"]
                    ) for _ in range(n)],
    "gender":       lambda n: [random.choice(["M", "F", "Other"]) for _ in range(n)],
    "created_at":   lambda n: _random_datetimes(n),
    "updated_at":   lambda n: _random_datetimes(n),
    "deleted_at":   lambda n: [
                        None if random.random() < 0.8 else _random_datetime()
                        for _ in range(n)
                    ],
    "birth":        lambda n: _random_dates(n, years_back=70, years_min=18),
    "dob":          lambda n: _random_dates(n, years_back=70, years_min=18),
    "ip":           lambda n: [faker.ipv4() for _ in range(n)],
    "uuid":         lambda n: [str(uuid.uuid4()) for _ in range(n)],
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_all_tables(
    schema: ParsedSchema,
    rows_per_table: int = 100,
    table_row_overrides: dict[str, int] | None = None,
) -> dict[str, pd.DataFrame]:
    """
    Generate synthetic data for every table in the schema.

    Returns a dict {table_name: DataFrame}.
    Tables are generated in topological order so FK parents exist first.
    """
    overrides = table_row_overrides or {}
    generated: dict[str, pd.DataFrame] = {}

    for table_name in schema.topological_order():
        table = schema.get_table(table_name)
        if table is None:
            continue
        n = overrides.get(table_name, rows_per_table)
        generated[table_name] = _generate_table(table, n, generated)

    return generated


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _generate_table(
    table: TableSchema,
    n: int,
    already_generated: dict[str, pd.DataFrame],
) -> pd.DataFrame:
    """Generate n rows for a single table."""
    # Build FK lookup: {local_column: [available_values]}
    fk_pools: dict[str, list] = {}
    for fk in table.foreign_keys:
        ref_df = already_generated.get(fk.ref_table)
        if ref_df is None or ref_df.empty:
            raise ValueError(
                f"Table '{table.name}' has a FK to '{fk.ref_table}' which has "
                "not been generated yet. Check for circular dependencies."
            )
        fk_pools[fk.column] = ref_df[fk.ref_column].tolist()

    data: dict[str, list] = {}

    for col in table.columns:
        if col.name in fk_pools:
            # Sample from parent FK pool (with replacement is fine)
            data[col.name] = random.choices(fk_pools[col.name], k=n)
        elif col.is_primary_key:
            data[col.name] = _generate_primary_keys(col, n)
        else:
            data[col.name] = _generate_column(col, n)

    return pd.DataFrame(data)


def _generate_primary_keys(col: ColumnSchema, n: int) -> list:
    """Generate n unique primary key values."""
    if col.data_type == "UUID":
        return [str(uuid.uuid4()) for _ in range(n)]
    if col.data_type == "INT":
        return list(range(1, n + 1))
    if col.data_type in ("VARCHAR", "TEXT"):
        return [str(uuid.uuid4())[:col.length or 36] for _ in range(n)]
    return list(range(1, n + 1))


def _generate_column(col: ColumnSchema, n: int) -> list:
    """Generate n values for a non-PK, non-FK column."""
    col_lower = col.name.lower()

    # 1. Check field rules (exact substring match, longest key wins)
    matched_rule = None
    matched_len = 0
    for keyword, rule_fn in FIELD_RULES.items():
        if keyword in col_lower and len(keyword) > matched_len:
            matched_rule = rule_fn
            matched_len = len(keyword)

    if matched_rule:
        values = matched_rule(n)
        return _apply_nulls(values, col)

    # 2. Fall back to type-based generation
    values = _generate_by_type(col, n)
    return _apply_nulls(values, col)


def _generate_by_type(col: ColumnSchema, n: int) -> list:
    dtype = col.data_type

    if dtype == "INT":
        return list(np.random.randint(1, 10_000, size=n))

    if dtype == "FLOAT":
        return list(np.round(np.random.uniform(0.0, 10_000.0, size=n), 4))

    if dtype == "VARCHAR":
        max_len = col.length or 50
        return [faker.lexify("?" * min(max_len, 20)) for _ in range(n)]

    if dtype == "TEXT":
        return [faker.text(max_nb_chars=200) for _ in range(n)]

    if dtype == "BOOLEAN":
        return [random.choice([True, False]) for _ in range(n)]

    if dtype == "DATE":
        return _random_dates(n)

    if dtype == "DATETIME":
        return _random_datetimes(n)

    if dtype == "UUID":
        return [str(uuid.uuid4()) for _ in range(n)]

    # Fallback: return None-filled list
    return [None] * n


def _apply_nulls(values: list, col: ColumnSchema) -> list:
    """Randomly null out ~10 % of nullable column values."""
    if not col.is_nullable or col.is_primary_key:
        return values
    return [None if random.random() < 0.1 else v for v in values]


# ---------------------------------------------------------------------------
# Date / datetime helpers
# ---------------------------------------------------------------------------

def _random_datetime(
    start: datetime | None = None,
    end: datetime | None = None,
) -> datetime:
    start = start or datetime(2010, 1, 1)
    end = end or datetime.now()
    delta = end - start
    return start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))


def _random_datetimes(n: int) -> list[datetime]:
    return [_random_datetime() for _ in range(n)]


def _random_dates(
    n: int,
    years_back: int = 5,
    years_min: int = 0,
) -> list[date]:
    end = date.today() - timedelta(days=years_min * 365)
    start = end - timedelta(days=years_back * 365)
    delta_days = (end - start).days
    return [start + timedelta(days=random.randint(0, delta_days)) for _ in range(n)]
