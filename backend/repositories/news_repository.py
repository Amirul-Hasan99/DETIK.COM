from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import Session
from models.news import NewsArticle
from typing import Optional
import math


class NewsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, article_data: dict) -> NewsArticle:
        article = NewsArticle(**article_data)
        self.db.add(article)
        await self.db.flush()
        return article

    async def bulk_create(self, articles: list[dict]) -> int:
        objects = [NewsArticle(**a) for a in articles]
        self.db.add_all(objects)
        await self.db.flush()
        return len(objects)

    async def get_all(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        label: Optional[str] = None,
        is_preprocessed: Optional[bool] = None,
    ) -> tuple[list[NewsArticle], int]:
        query = select(NewsArticle)
        count_query = select(func.count(NewsArticle.id))

        if search:
            search_filter = NewsArticle.judul_berita.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        if label:
            query = query.where(NewsArticle.label == label)
            count_query = count_query.where(NewsArticle.label == label)

        if is_preprocessed is not None:
            query = query.where(NewsArticle.is_preprocessed == is_preprocessed)
            count_query = count_query.where(NewsArticle.is_preprocessed == is_preprocessed)

        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(NewsArticle.id.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        articles = result.scalars().all()

        return list(articles), total

    async def get_all_no_pagination(self) -> list[NewsArticle]:
        result = await self.db.execute(select(NewsArticle).order_by(NewsArticle.id))
        return list(result.scalars().all())

    async def get_count(self) -> int:
        result = await self.db.execute(select(func.count(NewsArticle.id)))
        return result.scalar() or 0

    async def get_category_counts(self) -> dict[str, int]:
        result = await self.db.execute(
            select(NewsArticle.label, func.count(NewsArticle.id))
            .group_by(NewsArticle.label)
        )
        return {row[0]: row[1] for row in result.all()}

    async def get_preprocessed_count(self) -> int:
        result = await self.db.execute(
            select(func.count(NewsArticle.id)).where(NewsArticle.is_preprocessed == True)
        )
        return result.scalar() or 0

    async def update_preprocessing(self, article_id: int, judul_bersih: str, tokenisasi: str, jumlah_kata: int):
        result = await self.db.execute(
            select(NewsArticle).where(NewsArticle.id == article_id)
        )
        article = result.scalar_one_or_none()
        if article:
            article.judul_bersih = judul_bersih
            article.tokenisasi = tokenisasi
            article.jumlah_kata = jumlah_kata
            article.is_preprocessed = True
            await self.db.flush()

    async def delete_all(self):
        await self.db.execute(delete(NewsArticle))
        await self.db.flush()
