from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.training_repository import TrainingRepository

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.get("")
async def get_evaluation(
    session_id: str = None,
    db: AsyncSession = Depends(get_db),
):
    """Get evaluation results for all trained models."""
    training_repo = TrainingRepository(db)
    results = await training_repo.get_latest_results(session_id=session_id)

    if not results:
        return {"results": [], "message": "No training results found. Train models first."}

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
            for r in results
        ],
    }
