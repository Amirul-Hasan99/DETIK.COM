from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class TrainingRequest(BaseModel):
    max_features: int = 10000
    ngram_min: int = 1
    ngram_max: int = 2
    sublinear_tf: bool = True
    min_df: int = 2
    max_df: float = 0.95


class TrainingResultSchema(BaseModel):
    id: int
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: Optional[Any] = None
    classification_report: Optional[Any] = None
    is_best: bool = False
    training_session_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TrainingResponse(BaseModel):
    results: list[TrainingResultSchema]
    best_model: str
    best_accuracy: float
    session_id: str
