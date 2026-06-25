import os
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "News Mining Analytics System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./news_mining.db"

    # JWT
    JWT_SECRET_KEY: str = "news-mining-secret-key-change-in-production-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # File Paths
    BASE_DIR: str = str(Path(__file__).resolve().parent.parent)
    RAW_DATASET_PATH: str = str(Path(__file__).resolve().parent.parent / "dataset_detik_multiclass_update_sekali.csv")
    PREPROCESSED_DATASET_PATH: str = str(Path(__file__).resolve().parent.parent / "dataset_detik_preprocessing_update_sekali.csv")
    BEST_MODEL_PATH: str = str(Path(__file__).resolve().parent.parent / "best_model.pkl")
    TFIDF_VECTORIZER_PATH: str = str(Path(__file__).resolve().parent.parent / "tfidf_vectorizer.pkl")

    # Crawling
    CRAWL_BASE_URLS: dict[str, str] = {
        "News": "https://news.detik.com/berita",
        "Finance": "https://finance.detik.com",
        "Sport": "https://sport.detik.com",
        "Oto": "https://oto.detik.com",
        "Health": "https://health.detik.com",
        "Travel": "https://travel.detik.com",
    }

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
