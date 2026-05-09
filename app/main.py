from fastapi import FastAPI

from app.core.config import settings
from app.modules.ai.router import router as ai_router
from app.modules.auth.router import router as auth_router
from app.modules.materials.router import router as materials_router
from app.modules.subjects.router import router as subjects_router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI-powered study assistant API built with FastAPI.",
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.app_env,
    }


app.include_router(auth_router)
app.include_router(subjects_router)
app.include_router(materials_router)
app.include_router(ai_router)