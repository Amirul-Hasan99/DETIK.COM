from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from config import settings
from utils.helpers import setup_logging
import logging

# Import all routers
from routers import dashboard, crawl, dataset, preprocessing, analysis, training, evaluation, prediction, insights, export, auth

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("Starting News Mining Analytics System...")
    await init_db()
    logger.info("Database initialized successfully")

    # Create default admin user if not exists
    from database import async_session_maker
    from sqlalchemy import select
    from models.user import User
    from services.auth_service import hash_password

    async with async_session_maker() as session:
        result = await session.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            admin = User(
                username="admin",
                email="admin@newsmining.com",
                hashed_password=hash_password("admin123"),
                role="admin",
            )
            session.add(admin)

            demo_user = User(
                username="user",
                email="user@newsmining.com",
                hashed_password=hash_password("user123"),
                role="user",
            )
            session.add(demo_user)
            await session.commit()
            logger.info("Default users created (admin/admin123, user/user123)")

    yield
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="News Mining Analytics System - Indonesian News Classification with ML",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(crawl.router, prefix=settings.API_PREFIX)
app.include_router(dataset.router, prefix=settings.API_PREFIX)
app.include_router(preprocessing.router, prefix=settings.API_PREFIX)
app.include_router(analysis.router, prefix=settings.API_PREFIX)
app.include_router(training.router, prefix=settings.API_PREFIX)
app.include_router(evaluation.router, prefix=settings.API_PREFIX)
app.include_router(prediction.router, prefix=settings.API_PREFIX)
app.include_router(insights.router, prefix=settings.API_PREFIX)
app.include_router(export.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
