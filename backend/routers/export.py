from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.news_repository import NewsRepository
from repositories.prediction_repository import PredictionRepository
from services.export_service import export_raw_dataset, export_preprocessed_dataset, export_prediction_history
import io

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/raw")
async def export_raw(db: AsyncSession = Depends(get_db)):
    """Export raw dataset as CSV."""
    news_repo = NewsRepository(db)
    articles = await news_repo.get_all_no_pagination()

    article_dicts = [
        {
            "tanggal": a.tanggal,
            "judul_berita": a.judul_berita,
            "url": a.url,
            "label": a.label,
        }
        for a in articles
    ]

    csv_content = export_raw_dataset(article_dicts)
    return StreamingResponse(
        io.BytesIO(csv_content.encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dataset_raw.csv"},
    )


@router.get("/preprocessed")
async def export_preprocessed(db: AsyncSession = Depends(get_db)):
    """Export preprocessed dataset as CSV."""
    news_repo = NewsRepository(db)
    articles = await news_repo.get_all_no_pagination()

    article_dicts = [
        {
            "tanggal": a.tanggal,
            "judul_berita": a.judul_berita,
            "url": a.url,
            "label": a.label,
            "judul_bersih": a.judul_bersih,
            "tokenisasi": a.tokenisasi,
            "jumlah_kata": a.jumlah_kata,
        }
        for a in articles
    ]

    csv_content = export_preprocessed_dataset(article_dicts)
    return StreamingResponse(
        io.BytesIO(csv_content.encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dataset_preprocessed.csv"},
    )


@router.get("/predictions")
async def export_predictions(db: AsyncSession = Depends(get_db)):
    """Export prediction history as CSV."""
    prediction_repo = PredictionRepository(db)
    predictions = await prediction_repo.get_all(limit=10000)

    prediction_dicts = [
        {
            "input_text": p.input_text,
            "preprocessed_text": p.preprocessed_text,
            "predicted_label": p.predicted_label,
            "confidence": p.confidence,
            "model_used": p.model_used,
            "created_at": p.created_at.isoformat() if p.created_at else "",
        }
        for p in predictions
    ]

    csv_content = export_prediction_history(prediction_dicts)
    return StreamingResponse(
        io.BytesIO(csv_content.encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=prediction_history.csv"},
    )
