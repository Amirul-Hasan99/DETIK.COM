from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NewsArticleCreate(BaseModel):
    tanggal: Optional[str] = None
    judul_berita: str
    url: Optional[str] = None
    label: str
    judul_bersih: Optional[str] = None
    tokenisasi: Optional[str] = None
    jumlah_kata: Optional[int] = None


class NewsArticleSchema(BaseModel):
    id: int
    tanggal: Optional[str] = None
    judul_berita: str
    url: Optional[str] = None
    label: str
    judul_bersih: Optional[str] = None
    tokenisasi: Optional[str] = None
    jumlah_kata: Optional[int] = None
    is_preprocessed: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    data: list[NewsArticleSchema]
    total: int
    page: int
    page_size: int
    total_pages: int
