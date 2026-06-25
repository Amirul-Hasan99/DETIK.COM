from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.sql import func
from database import Base


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    input_text = Column(Text, nullable=False)
    preprocessed_text = Column(Text, nullable=True)
    predicted_label = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<PredictionHistory(id={self.id}, label='{self.predicted_label}')>"
