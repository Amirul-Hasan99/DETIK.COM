from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from models.prediction import PredictionHistory


class PredictionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, prediction_data: dict) -> PredictionHistory:
        prediction = PredictionHistory(**prediction_data)
        self.db.add(prediction)
        await self.db.flush()
        return prediction

    async def get_all(self, limit: int = 100) -> list[PredictionHistory]:
        result = await self.db.execute(
            select(PredictionHistory)
            .order_by(PredictionHistory.id.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_count(self) -> int:
        result = await self.db.execute(select(func.count(PredictionHistory.id)))
        return result.scalar() or 0

    async def delete_all(self):
        await self.db.execute(delete(PredictionHistory))
        await self.db.flush()
