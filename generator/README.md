# Syngen – Synthetic Data Generator

A production-ready FastAPI backend that accepts a SQL schema and generates
large-scale, realistic synthetic data while preserving data types, foreign key
relationships, constraints, and statistical realism.

---

## Project Structure

```
syngen/
├── main.py          # FastAPI application & all endpoints
├── parser.py        # SQL schema parser
├── generator.py     # Synthetic data generation engine (Faker + NumPy)
├── models.py        # Pydantic data models
├── utils.py         # CSV / SQL export helpers
├── requirements.txt
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit the **interactive docs** at → http://localhost:8000/docs

---

## API Endpoints

### Health check

```bash
curl http://localhost:8000/healthz
```

---

### POST `/upload-schema` — Parse a SQL schema

**Via form text:**

```bash
curl -X POST http://localhost:8000/upload-schema \
     -F 'sql_text=CREATE TABLE users (
           id INT PRIMARY KEY,
           name VARCHAR(100),
           email VARCHAR(100),
           age INT,
           created_at DATETIME
         );
         CREATE TABLE orders (
           order_id INT PRIMARY KEY,
           user_id INT,
           amount FLOAT,
           status VARCHAR(20),
           FOREIGN KEY (user_id) REFERENCES users(id)
         );'
```

**Via file upload:**

```bash
curl -X POST http://localhost:8000/upload-schema \
     -F 'file=@schema.sql'
```

**Response:**

```json
{
  "message": "Schema parsed successfully.",
  "tables": ["users", "orders"],
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

---

### POST `/generate-data` — Generate synthetic rows

```bash
curl -X POST http://localhost:8000/generate-data \
     -H 'Content-Type: application/json' \
     -d '{
           "session_id": "<session_id>",
           "rows_per_table": 1000,
           "table_row_overrides": {"orders": 5000}
         }'
```

**Response:**

```json
{
  "message": "Data generated successfully.",
  "session_id": "...",
  "tables_generated": ["users", "orders"],
  "row_counts": { "users": 1000, "orders": 5000 }
}
```

---

### GET `/download/csv` — Download all tables as a ZIP of CSV files

```bash
curl "http://localhost:8000/download/csv?session_id=<session_id>" \
     -o syngen_data.zip
```

---

### GET `/download/csv/{table_name}` — Download a single table as CSV

```bash
curl "http://localhost:8000/download/csv/users?session_id=<session_id>" \
     -o users.csv
```

---

### GET `/download/sql` — Download as SQL INSERT statements

```bash
curl "http://localhost:8000/download/sql?session_id=<session_id>" \
     -o inserts.sql
```

---

### GET `/preview/{table_name}` — JSON preview (up to 100 rows)

```bash
curl "http://localhost:8000/preview/users?session_id=<session_id>&rows=5"
```

---

### GET `/schema/{session_id}` — Inspect the parsed schema

```bash
curl http://localhost:8000/schema/<session_id>
```

---

## Supported SQL Data Types

| SQL Type                        | Generated As                 |
| ------------------------------- | ---------------------------- |
| INT, INTEGER, BIGINT, SMALLINT  | Integer (realistic range)    |
| FLOAT, DOUBLE, DECIMAL, NUMERIC | Float (realistic range)      |
| VARCHAR(n), CHAR(n)             | String (respects max length) |
| TEXT, LONGTEXT                  | Faker paragraph              |
| BOOLEAN / BOOL                  | True / False                 |
| DATE                            | Random date (last 5 years)   |
| DATETIME, TIMESTAMP             | Random datetime (2010–now)   |
| UUID                            | UUID v4 string               |

---

## Intelligent Field Rules

Columns are matched by name keyword for semantic realism:

| Keyword in column name | Generated value                           |
| ---------------------- | ----------------------------------------- |
| `email`                | realistic email address                   |
| `name`, `first_name`   | realistic person name                     |
| `age`                  | normal distribution μ=35, σ=12 (18–90)    |
| `amount`, `price`      | log-normal distribution (realistic spend) |
| `salary`               | normal distribution μ=55k (20k–300k)      |
| `phone`                | phone number                              |
| `address`, `city`      | Faker location                            |
| `status`               | active / inactive / pending / suspended   |
| `created_at`           | random datetime                           |
| `email`                | unique email per row                      |
| `uuid`                 | UUID v4                                   |
| … and 20+ more         |                                           |

---

## Foreign Key Handling

Tables are generated in **topological order** (parents before children).
Child-table FK columns are sampled from the parent's already-generated PK pool,
guaranteeing 100% referential integrity.

---

## Example Schema (schema.sql)

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    age INT,
    created_at DATETIME
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    title VARCHAR(200),
    price FLOAT,
    description TEXT
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    user_id INT,
    amount FLOAT,
    status VARCHAR(20),
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    item_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price FLOAT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

---

## Notes

- Sessions are stored **in-memory**. Restart the server to clear all data.
- For production, replace the in-memory dicts with Redis or a database.
- Max rows per table: **100,000** (configurable in `models.py`).
- CORS is open (`*`) — restrict `allow_origins` in `main.py` for production.
