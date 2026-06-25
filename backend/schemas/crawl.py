from pydantic import BaseModel
from typing import Optional


class CrawlRequest(BaseModel):
    categories: dict[str, int] = {
        "News": 200,
        "Finance": 200,
        "Sport": 200,
        "Oto": 200,
        "Health": 200,
        "Travel": 200,
    }


class CrawlProgress(BaseModel):
    category: str
    current: int
    total: int
    status: str  # "crawling", "completed", "error"
    message: Optional[str] = None
