from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float
from sqlalchemy.sql import func
from database import Base


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tanggal = Column(String(255), nullable=True)
    judul_berita = Column(Text, nullable=False)
    url = Column(Text, nullable=True)
    label = Column(String(50), nullable=False, index=True)
    judul_bersih = Column(Text, nullable=True)
    tokenisasi = Column(Text, nullable=True)
    jumlah_kata = Column(Integer, nullable=True)
    is_preprocessed = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<NewsArticle(id={self.id}, label='{self.label}', judul='{self.judul_berita[:50]}...')>"
