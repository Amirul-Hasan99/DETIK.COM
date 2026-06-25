from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.news_repository import NewsRepository
from repositories.training_repository import TrainingRepository
from services.analysis_service import generate_insights

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("")
async def get_insights(db: AsyncSession = Depends(get_db)):
    """Generate automatic insights from data and training results."""
    news_repo = NewsRepository(db)
    training_repo = TrainingRepository(db)

    articles = await news_repo.get_all_no_pagination()
    article_dicts = [
        {
            "judul_berita": a.judul_berita,
            "label": a.label,
            "judul_bersih": a.judul_bersih,
            "jumlah_kata": a.jumlah_kata,
        }
        for a in articles
    ]

    training_results = await training_repo.get_latest_results()
    training_dicts = [
        {
            "model_name": r.model_name,
            "accuracy": r.accuracy,
            "precision": r.precision,
            "recall": r.recall,
            "f1_score": r.f1_score,
            "is_best": r.is_best,
        }
        for r in training_results
    ]

    insights = generate_insights(article_dicts, training_dicts)
    return {"insights": insights}
