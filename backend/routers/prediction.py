from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repositories.prediction_repository import PredictionRepository
from schemas.prediction import PredictionRequest
from services.prediction_service import predict, reload_model

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("")
async def make_prediction(
    request: PredictionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Predict the category of a news title."""
    prediction = predict(request.text)

    # Save to history
    prediction_repo = PredictionRepository(db)
    await prediction_repo.create({
        "input_text": prediction["input_text"],
        "preprocessed_text": prediction["preprocessed_text"],
        "predicted_label": prediction["predicted_label"],
        "confidence": prediction.get("confidence"),
        "model_used": prediction.get("model_used"),
    })

    return prediction


@router.get("/history")
async def get_prediction_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Get prediction history."""
    prediction_repo = PredictionRepository(db)
    predictions = await prediction_repo.get_all(limit=limit)

    return {
        "data": [
            {
                "id": p.id,
                "input_text": p.input_text,
                "preprocessed_text": p.preprocessed_text,
                "predicted_label": p.predicted_label,
                "confidence": p.confidence,
                "model_used": p.model_used,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in predictions
        ],
        "total": len(predictions),
    }


@router.post("/reload-model")
async def reload_prediction_model():
    """Reload the prediction model from disk."""
    try:
        reload_model()
        return {"success": True, "message": "Model reloaded successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}
