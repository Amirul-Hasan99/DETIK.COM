from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update
from models.training_result import TrainingResult
from typing import Optional


class TrainingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, result_data: dict) -> TrainingResult:
        result = TrainingResult(**result_data)
        self.db.add(result)
        await self.db.flush()
        return result

    async def bulk_create(self, results: list[dict]) -> list[TrainingResult]:
        objects = [TrainingResult(**r) for r in results]
        self.db.add_all(objects)
        await self.db.flush()
        return objects

    async def get_latest_results(self, session_id: Optional[str] = None) -> list[TrainingResult]:
        query = select(TrainingResult)
        if session_id:
            query = query.where(TrainingResult.training_session_id == session_id)
        else:
            # Get the latest session
            sub = select(TrainingResult.training_session_id).order_by(
                TrainingResult.created_at.desc()
            ).limit(1)
            sub_result = await self.db.execute(sub)
            latest_session = sub_result.scalar_one_or_none()
            if latest_session:
                query = query.where(TrainingResult.training_session_id == latest_session)

        query = query.order_by(TrainingResult.accuracy.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_best_model(self) -> Optional[TrainingResult]:
        result = await self.db.execute(
            select(TrainingResult)
            .where(TrainingResult.is_best == True)
            .order_by(TrainingResult.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def clear_best_flags(self):
        await self.db.execute(
            update(TrainingResult).values(is_best=False)
        )
        await self.db.flush()

    async def delete_all(self):
        await self.db.execute(delete(TrainingResult))
        await self.db.flush()
