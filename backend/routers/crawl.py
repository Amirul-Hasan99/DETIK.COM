from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.news_repository import NewsRepository
from schemas.crawl import CrawlRequest
from services.crawl_service import crawl_all_categories
from config import settings
import pandas as pd
import json
import asyncio

router = APIRouter(prefix="/crawl", tags=["Crawling"])


@router.post("/start")
async def start_crawling(request: CrawlRequest):
    """Start crawling with SSE progress updates."""
    async def event_generator():
        for update in crawl_all_categories(request.categories):
            yield f"data: {json.dumps(update)}\n\n"
            await asyncio.sleep(0.01)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/import-csv")
async def import_from_csv(db: AsyncSession = Depends(get_db)):
    """Import data from existing CSV files into the database."""
    news_repo = NewsRepository(db)

    # Check if data already exists
    existing_count = await news_repo.get_count()

    imported = 0
    errors = []

    try:
        # Import raw dataset
        raw_path = settings.RAW_DATASET_PATH
        df_raw = pd.read_csv(raw_path, encoding="utf-8")

        # Also try to load preprocessed data
        preprocessed_path = settings.PREPROCESSED_DATASET_PATH
        df_prep = None
        try:
            df_prep = pd.read_csv(preprocessed_path, encoding="utf-8")
        except Exception:
            pass

        articles = []
        for idx, row in df_raw.iterrows():
            article = {
                "tanggal": str(row.get("Tanggal", "")),
                "judul_berita": str(row.get("Judul Berita", "")),
                "url": str(row.get("URL", "")),
                "label": str(row.get("Label", "")),
            }

            # Add preprocessed data if available
            if df_prep is not None and idx < len(df_prep):
                prep_row = df_prep.iloc[idx]
                article["judul_bersih"] = str(prep_row.get("Judul Bersih", ""))
                article["tokenisasi"] = str(prep_row.get("Tokenisasi", ""))
                article["jumlah_kata"] = int(prep_row.get("Jumlah Kata", 0)) if pd.notna(prep_row.get("Jumlah Kata")) else 0
                article["is_preprocessed"] = True
            else:
                article["is_preprocessed"] = False

            articles.append(article)

        # Bulk insert
        if articles:
            imported = await news_repo.bulk_create(articles)

    except Exception as e:
        errors.append(str(e))

    return {
        "success": len(errors) == 0,
        "imported": imported,
        "existing_count": existing_count,
        "total_count": existing_count + imported,
        "errors": errors,
    }


@router.post("/save-crawled")
async def save_crawled_articles(articles: list[dict], db: AsyncSession = Depends(get_db)):
    """Save crawled articles to the database."""
    news_repo = NewsRepository(db)
    count = await news_repo.bulk_create(articles)
    return {"saved": count}
