from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.news_repository import NewsRepository
from repositories.training_repository import TrainingRepository
from schemas.training import TrainingRequest
from services.training_service import train_models

router = APIRouter(prefix="/training", tags=["Training"])


@router.post("/run")
async def run_training(
    request: TrainingRequest = TrainingRequest(),
    db: AsyncSession = Depends(get_db),
):
    """Train all ML models on the preprocessed dataset."""
    news_repo = NewsRepository(db)
    training_repo = TrainingRepository(db)

    # Get all preprocessed articles
    articles = await news_repo.get_all_no_pagination()
    preprocessed = [a for a in articles if a.is_preprocessed and a.judul_bersih]

    if not preprocessed:
        return {"error": "No preprocessed data available. Run preprocessing first."}

    article_dicts = [
        {
            "judul_bersih": a.judul_bersih,
            "label": a.label,
        }
        for a in preprocessed
    ]

    # Train models
    training_output = train_models(
        articles=article_dicts,
        max_features=request.max_features,
        ngram_range=(request.ngram_min, request.ngram_max),
        sublinear_tf=request.sublinear_tf,
        min_df=request.min_df,
        max_df=request.max_df,
    )

    # Clear previous best flags and save new results
    await training_repo.clear_best_flags()

    saved_results = []
    for result in training_output["results"]:
        saved = await training_repo.create(result)
        saved_results.append(saved)

    return {
        "results": [
            {
                "id": r.id,
                "model_name": r.model_name,
                "accuracy": r.accuracy,
                "precision": r.precision,
                "recall": r.recall,
                "f1_score": r.f1_score,
                "confusion_matrix": r.confusion_matrix,
                "classification_report": r.classification_report,
                "is_best": r.is_best,
                "training_session_id": r.training_session_id,
            }
            for r in saved_results
        ],
        "best_model": training_output["best_model"],
        "best_accuracy": training_output["best_accuracy"],
        "session_id": training_output["session_id"],
    }
