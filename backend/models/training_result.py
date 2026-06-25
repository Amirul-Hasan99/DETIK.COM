from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, JSON
from sqlalchemy.sql import func
from database import Base


class TrainingResult(Base):
    __tablename__ = "training_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(100), nullable=False)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    confusion_matrix = Column(JSON, nullable=True)
    classification_report = Column(JSON, nullable=True)
    is_best = Column(Boolean, default=False, index=True)
    training_session_id = Column(String(50), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<TrainingResult(id={self.id}, model='{self.model_name}', accuracy={self.accuracy:.4f})>"
