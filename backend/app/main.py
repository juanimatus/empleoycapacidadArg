from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import employment, roles, sources
from app.ingestion.seed_all import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed()
    yield


app = FastAPI(
    title="Observatorio de Empleo IT Argentina",
    description=(
        "API del MVP del observatorio de empleo IT en Argentina, segmentado "
        "por familias de roles, con foco en transparencia de fuentes."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roles.router)
app.include_router(employment.router)
app.include_router(sources.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
