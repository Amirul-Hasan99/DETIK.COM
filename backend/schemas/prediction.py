from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PredictionRequest(BaseModel):
    text: str


class PredictionResponse(BaseModel):
    input_text: str
    preprocessed_text: str
    predicted_label: str
    confidence: Optional[float] = None
    model_used: Optional[str] = None


class PredictionHistorySchema(BaseModel):
    id: int
    input_text: str
    preprocessed_text: Optional[str] = None
    predicted_label: str
    confidence: Optional[float] = None
    model_used: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PredictionHistoryListResponse(BaseModel):
    data: list[PredictionHistorySchema]
    total: int
