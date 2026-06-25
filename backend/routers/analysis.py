from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.news_repository import NewsRepository
from services.analysis_service import compute_data_understanding, compute_eda

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.get("/understanding")
async def get_data_understanding(db: AsyncSession = Depends(get_db)):
    """Compute automatic data understanding metrics."""
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

    return compute_data_understanding(article_dicts)


@router.get("/eda")
async def get_eda(db: AsyncSession = Depends(get_db)):
    """Get exploratory data analysis results."""
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

    return compute_eda(article_dicts)
