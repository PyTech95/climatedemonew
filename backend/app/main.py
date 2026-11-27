"""Prisha Boutique API.

    uvicorn app.main:app --reload --port 8000

Serves the JSON API under /api and, when frontend/dist exists, the built React website for every other path.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from . import routes_admin, routes_store
from .config import settings
from .db import ensure_indexes, get_db
from .seed import bootstrap, seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = get_db()
    ensure_indexes(db)
    if settings.demo_mode:
        seed_database(db)  # only writes when the database is empty
    bootstrap(db)
    yield


app = FastAPI(title="Prisha Boutique API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=settings.cors_origins, allow_methods=["*"], allow_headers=["*"],
)
app.include_router(routes_store.router)
app.include_router(routes_admin.router)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    """Turn Pydantic's error list into one plain sentence the website can show."""
    first = exc.errors()[0]
    field = str(first["loc"][-1]) if first.get("loc") else "field"
    message = first.get("msg", "Invalid value").replace("Value error, ", "")
    return JSONResponse(status_code=422, content={"detail": f"{field}: {message}"})


@app.get("/api/health")
def health():
    get_db().list_collection_names()  # raises if the database cannot be reached
    return {"ok": True}


@app.api_route("/api/{rest:path}", methods=["GET", "POST", "PUT", "DELETE"], include_in_schema=False)
def api_not_found(rest: str):
    raise HTTPException(404, "Not found.")


# ---- built React app (single-page app: unknown paths fall back to index.html) ----
DIST = settings.frontend_dist


@app.get("/{path:path}", include_in_schema=False)
def website(path: str):
    if not DIST.is_dir():
        raise HTTPException(404, "Frontend build not found. Run `npm run build` in frontend/, or use the Vite dev server.")
    target = (DIST / path).resolve()
    if path and target.is_file() and DIST.resolve() in target.parents:
        return FileResponse(target)
    return FileResponse(DIST / "index.html", headers={"Cache-Control": "no-cache"})
