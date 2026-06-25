from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.news_repository import NewsRepository
from services.preprocessing_service import preprocess_batch, get_preprocessing_comparison

router = APIRouter(prefix="/preprocess", tags=["Preprocessing"])


@router.post("/run")
async def run_preprocessing(db: AsyncSession = Depends(get_db)):
    """Run preprocessing pipeline on all unprocessed articles."""
    news_repo = NewsRepository(db)
    articles, total = await news_repo.get_all(page=1, page_size=50000, is_preprocessed=False)

    if not articles:
        return {
            "success": True,
            "processed": 0,
            "message": "No unprocessed articles found.",
        }

    # Prepare data for batch processing
    article_dicts = [
        {"id": a.id, "judul_berita": a.judul_berita}
        for a in articles
    ]

    # Run preprocessing
    results = preprocess_batch(article_dicts)

    # Update database
    updated = 0
    for result in results:
        await news_repo.update_preprocessing(
            article_id=result["id"],
            judul_bersih=result["judul_bersih"],
            tokenisasi=result["tokenisasi"],
            jumlah_kata=result["jumlah_kata"],
        )
        updated += 1

    return {
        "success": True,
        "processed": updated,
        "total_articles": total,
        "message": f"Successfully preprocessed {updated} articles.",
    }


@router.post("/preview")
async def preview_preprocessing(text: dict):
    """Preview preprocessing steps for a given text."""
    input_text = text.get("text", "")
    if not input_text:
        return {"error": "No text provided"}

    comparison = get_preprocessing_comparison(input_text)
    return comparison


@router.get("/comparison")
async def get_comparison_table(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """Get before/after comparison table."""
    news_repo = NewsRepository(db)
    articles, _ = await news_repo.get_all(page=1, page_size=limit, is_preprocessed=True)

    comparison = []
    for a in articles:
        comparison.append({
            "id": a.id,
            "original": a.judul_berita,
            "preprocessed": a.judul_bersih or "",
            "tokens": a.tokenisasi or "[]",
            "word_count": a.jumlah_kata or 0,
        })

    return {"comparison": comparison, "total": len(comparison)}
