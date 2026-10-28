import json
from functools import cache
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/api/coa", tags=["clasificador"])

COA_PATH = Path(__file__).resolve().parents[3] / "data" / "curated" / "coa.json"


@cache
def coa() -> dict:
    """COA: clasificador propio de todas las ocupaciones (ver data/curated/coa.json)."""
    return json.loads(COA_PATH.read_text(encoding="utf-8"))


@router.get("")
def get_coa():
    return coa()
