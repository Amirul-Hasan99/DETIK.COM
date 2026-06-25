from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.news_repository import NewsRepository
from repositories.training_repository import TrainingRepository
from repositories.prediction_repository import PredictionRepository
from pathlib import Path
from config import settings

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """Get dashboard KPI data and summary statistics."""
    news_repo = NewsRepository(db)
    training_repo = TrainingRepository(db)
    prediction_repo = PredictionRepository(db)

    total_news = await news_repo.get_count()
    category_counts = await news_repo.get_category_counts()
    preprocessed_count = await news_repo.get_preprocessed_count()
    prediction_count = await prediction_repo.get_count()

    # Best model info
    best_model = await training_repo.get_best_model()
    best_model_name = best_model.model_name if best_model else "Not trained yet"
    best_accuracy = best_model.accuracy if best_model else 0.0

    # Check if model files exist
    model_exists = Path(settings.BEST_MODEL_PATH).exists()
    vectorizer_exists = Path(settings.TFIDF_VECTORIZER_PATH).exists()

    return {
        "kpi": {
            "total_news": total_news,
            "total_categories": len(category_counts),
            "best_model": best_model_name,
            "best_accuracy": round(best_accuracy * 100, 2),
            "preprocessed_count": preprocessed_count,
            "prediction_count": prediction_count,
            "model_ready": model_exists and vectorizer_exists,
        },
        "category_distribution": [
            {"name": k, "value": v} for k, v in category_counts.items()
        ],
        "recent_training": {
            "model_name": best_model_name,
            "accuracy": best_accuracy,
        } if best_model else None,
    }
