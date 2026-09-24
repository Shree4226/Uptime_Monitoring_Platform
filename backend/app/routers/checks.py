from fastapi import APIRouter


router = APIRouter(
    prefix="/checks",
    tags=["Checks"],
)

