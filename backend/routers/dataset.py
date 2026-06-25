from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.news_repository import NewsRepository
from schemas.news import NewsListResponse
from typing import Optional
import math

router = APIRouter(prefix="/dataset", tags=["Dataset"])


@router.get("")
async def get_dataset(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    label: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get paginated dataset with search and filter."""
    news_repo = NewsRepository(db)
    articles, total = await news_repo.get_all(
        page=page,
        page_size=page_size,
        search=search,
        label=label,
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return {
        "data": [
            {
                "id": a.id,
                "tanggal": a.tanggal,
                "judul_berita": a.judul_berita,
                "url": a.url,
                "label": a.label,
                "judul_bersih": a.judul_bersih,
                "tokenisasi": a.tokenisasi,
                "jumlah_kata": a.jumlah_kata,
                "is_preprocessed": a.is_preprocessed,
            }
            for a in articles
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all unique categories."""
    news_repo = NewsRepository(db)
    counts = await news_repo.get_category_counts()
    return {"categories": [{"name": k, "count": v} for k, v in counts.items()]}


@router.delete("/clear")
async def clear_dataset(db: AsyncSession = Depends(get_db)):
    """Clear all dataset entries."""
    news_repo = NewsRepository(db)
    await news_repo.delete_all()
    return {"success": True, "message": "Dataset cleared"}
