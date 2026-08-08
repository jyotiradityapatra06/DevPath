from fastapi import FastAPI

from app.routers.auth import router as auth_router


app = FastAPI(title="DevPath API", version="0.1.0")
app.include_router(auth_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "DevPath API running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": "DevPath API"}
