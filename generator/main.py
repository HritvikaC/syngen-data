"""
main.py - Syngen FastAPI application.

Endpoints
---------
POST /upload-schema        Accept SQL text or file upload; parse and store schema.
POST /generate-data        Generate synthetic rows for all tables.
GET  /download/csv         Download all tables as a ZIP of CSV files.
GET  /download/csv/{table} Download a single table as CSV.
GET  /download/sql         Download all tables as SQL INSERT statements.
GET  /schema/{session_id}  Inspect the parsed schema for a session.
GET  /healthz              Health check.
"""

import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse, Response

from generator import generate_all_tables
from models import (
    GenerateRequest,
    GenerateResponse,
    ParsedSchema,
    UploadSchemaResponse,
)
from parser import parse_schema
from utils import (
    dataframe_to_csv_bytes,
    dataframes_to_csv_zip,
    dataframes_to_sql_inserts,
    validate_session,
)

# ---------------------------------------------------------------------------
# In-memory stores (replace with Redis / DB for production)
# schema_store : session_id -> ParsedSchema
# data_store   : session_id -> dict[table_name, pd.DataFrame]
# ---------------------------------------------------------------------------
schema_store: dict[str, ParsedSchema] = {}
data_store: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    print("✅  Syngen backend is running.")
    yield
    print("🛑  Syngen backend shutting down.")


app = FastAPI(
    title="Syngen – Synthetic Data Generator",
    description=(
        "Upload a SQL schema and generate large-scale realistic synthetic data "
        "that respects data types, foreign keys, and statistical distributions."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/healthz", tags=["System"])
def health_check():
    return {"status": "ok", "service": "syngen"}


# ---------------------------------------------------------------------------
# 1. POST /upload-schema
# ---------------------------------------------------------------------------

@app.post("/upload-schema", response_model=UploadSchemaResponse, tags=["Schema"])
async def upload_schema(
    sql_text: str | None = Form(default=None, description="Raw SQL CREATE TABLE statements"),
    file: UploadFile | None = File(default=None, description="A .sql file"),
):
    """
    Accept a SQL schema via form field (sql_text) **or** file upload.
    Returns a session_id to use in subsequent requests.

    **Example curl (text):**
    ```
    curl -X POST http://localhost:8000/upload-schema \\
         -F 'sql_text=CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));'
    ```

    **Example curl (file):**
    ```
    curl -X POST http://localhost:8000/upload-schema \\
         -F 'file=@schema.sql'
    ```
    """
    # Resolve SQL source
    if file is not None:
        raw_sql = (await file.read()).decode("utf-8")
    elif sql_text:
        raw_sql = sql_text
    else:
        raise HTTPException(
            status_code=422,
            detail="Provide either 'sql_text' (form field) or a file upload.",
        )

    # Parse
    try:
        schema = parse_schema(raw_sql)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Store
    session_id = str(uuid.uuid4())
    schema_store[session_id] = schema

    return UploadSchemaResponse(
        message="Schema parsed successfully.",
        tables=[t.name for t in schema.tables],
        session_id=session_id,
    )


# ---------------------------------------------------------------------------
# 2. POST /generate-data
# ---------------------------------------------------------------------------

@app.post("/generate-data", response_model=GenerateResponse, tags=["Data Generation"])
def generate_data(body: GenerateRequest):
    """
    Generate synthetic rows for all tables in the session's schema.

    - **session_id** – returned by `/upload-schema`
    - **rows_per_table** – default row count (1–100 000)
    - **table_row_overrides** – per-table override, e.g. `{"orders": 500}`

    **Example curl:**
    ```
    curl -X POST http://localhost:8000/generate-data \\
         -H 'Content-Type: application/json' \\
         -d '{"session_id": "<id>", "rows_per_table": 200}'
    ```
    """
    try:
        validate_session(body.session_id, schema_store, data_store)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    schema = schema_store[body.session_id]

    try:
        dataframes = generate_all_tables(
            schema,
            rows_per_table=body.rows_per_table,
            table_row_overrides=body.table_row_overrides,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Generation error: {exc}")

    data_store[body.session_id] = dataframes

    return GenerateResponse(
        message="Data generated successfully.",
        session_id=body.session_id,
        tables_generated=list(dataframes.keys()),
        row_counts={name: len(df) for name, df in dataframes.items()},
    )


# ---------------------------------------------------------------------------
# 3. GET /download/csv  (all tables → ZIP)
# ---------------------------------------------------------------------------

@app.get("/download/csv", tags=["Download"])
def download_csv_zip(session_id: str = Query(..., description="Session ID")):
    """
    Download all generated tables as a ZIP archive of CSV files.

    **Example curl:**
    ```
    curl "http://localhost:8000/download/csv?session_id=<id>" -o syngen_data.zip
    ```
    """
    try:
        validate_session(session_id, schema_store, data_store, require_data=True)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    zip_bytes = dataframes_to_csv_zip(data_store[session_id])
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=syngen_data.zip"},
    )


# ---------------------------------------------------------------------------
# 3b. GET /download/csv/{table}  (single table CSV)
# ---------------------------------------------------------------------------

@app.get("/download/csv/{table_name}", tags=["Download"])
def download_csv_single(
    table_name: str,
    session_id: str = Query(..., description="Session ID"),
):
    """
    Download a single table as a CSV file.

    **Example curl:**
    ```
    curl "http://localhost:8000/download/csv/users?session_id=<id>" -o users.csv
    ```
    """
    try:
        validate_session(session_id, schema_store, data_store, require_data=True)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    tables = data_store[session_id]
    if table_name not in tables:
        raise HTTPException(
            status_code=404,
            detail=f"Table '{table_name}' not found. Available: {list(tables.keys())}",
        )

    csv_bytes = dataframe_to_csv_bytes(tables[table_name])
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={table_name}.csv"},
    )


# ---------------------------------------------------------------------------
# 4. GET /download/sql
# ---------------------------------------------------------------------------

@app.get("/download/sql", tags=["Download"])
def download_sql(session_id: str = Query(..., description="Session ID")):
    """
    Download all generated data as SQL INSERT statements.

    **Example curl:**
    ```
    curl "http://localhost:8000/download/sql?session_id=<id>" -o inserts.sql
    ```
    """
    try:
        validate_session(session_id, schema_store, data_store, require_data=True)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    sql_text = dataframes_to_sql_inserts(data_store[session_id])
    return Response(
        content=sql_text.encode("utf-8"),
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=syngen_inserts.sql"},
    )


# ---------------------------------------------------------------------------
# 5. GET /schema/{session_id}  – inspect parsed schema
# ---------------------------------------------------------------------------

@app.get("/schema/{session_id}", tags=["Schema"])
def get_schema(session_id: str):
    """
    Return the parsed schema (tables, columns, types, PKs, FKs) for a session.
    Useful for debugging and frontend display.
    """
    if session_id not in schema_store:
        raise HTTPException(status_code=404, detail="Session not found.")
    return schema_store[session_id].model_dump()


# ---------------------------------------------------------------------------
# 6. GET /preview/{table_name}  – row preview
# ---------------------------------------------------------------------------

@app.get("/preview/{table_name}", tags=["Data Generation"])
def preview_table(
    table_name: str,
    session_id: str = Query(...),
    rows: int = Query(default=10, ge=1, le=100),
):
    """
    Return a JSON preview of up to `rows` rows from a generated table.

    **Example curl:**
    ```
    curl "http://localhost:8000/preview/users?session_id=<id>&rows=5"
    ```
    """
    try:
        validate_session(session_id, schema_store, data_store, require_data=True)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    tables = data_store[session_id]
    if table_name not in tables:
        raise HTTPException(
            status_code=404,
            detail=f"Table '{table_name}' not found. Available: {list(tables.keys())}",
        )

    df = tables[table_name].head(rows)
    return JSONResponse(content=df.to_dict(orient="records"))


# ---------------------------------------------------------------------------
# Global error handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Unexpected server error: {str(exc)}"},
    )
