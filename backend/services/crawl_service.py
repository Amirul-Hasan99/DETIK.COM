import requests
from bs4 import BeautifulSoup
import time
import logging
from typing import Generator
from config import settings

logger = logging.getLogger(__name__)

CATEGORY_URLS = {
    "News": "https://news.detik.com/berita",
    "Finance": "https://finance.detik.com/berita",
    "Sport": "https://sport.detik.com/sepakbola",
    "Oto": "https://oto.detik.com/berita",
    "Health": "https://health.detik.com/berita",
    "Travel": "https://travel.detik.com/travel-news",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def crawl_category(category: str, count: int) -> Generator[dict, None, None]:
    """
    Crawl news articles from detik.com for a given category.
    Yields article dicts and progress updates.
    """
    base_url = CATEGORY_URLS.get(category)
    if not base_url:
        yield {"type": "error", "message": f"Unknown category: {category}"}
        return

    articles = []
    page = 1
    collected = 0

    while collected < count:
        try:
            url = f"{base_url}?page={page}" if page > 1 else base_url
            response = requests.get(url, headers=HEADERS, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")

            # Try multiple selectors for detik.com
            article_elements = soup.select("article") or soup.select(".list-content__item") or soup.select(".media__text")

            if not article_elements:
                # Try more generic selectors
                article_elements = soup.select("[class*='media']")

            if not article_elements:
                yield {"type": "progress", "message": f"No more articles found on page {page}"}
                break

            for elem in article_elements:
                if collected >= count:
                    break

                # Extract title and URL
                link = elem.select_one("a")
                title_elem = elem.select_one("h2, h3, .media__title, .media__link") or link

                if not link or not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                href = link.get("href", "")

                if not title or not href:
                    continue

                # Extract date
                date_elem = elem.select_one("span.media__date, .date, time, [class*='date']")
                date_text = date_elem.get_text(strip=True) if date_elem else ""

                article = {
                    "tanggal": date_text,
                    "judul_berita": title,
                    "url": href,
                    "label": category,
                }
                articles.append(article)
                collected += 1

                yield {
                    "type": "article",
                    "data": article,
                    "progress": {"current": collected, "total": count, "category": category}
                }

            page += 1
            time.sleep(0.5)  # Rate limiting

        except requests.RequestException as e:
            logger.error(f"Error crawling {category} page {page}: {e}")
            yield {"type": "error", "message": f"Error on page {page}: {str(e)}"}
            break
        except Exception as e:
            logger.error(f"Unexpected error crawling {category}: {e}")
            yield {"type": "error", "message": f"Unexpected error: {str(e)}"}
            break

    yield {
        "type": "completed",
        "category": category,
        "total_collected": collected,
        "articles": articles,
    }


def crawl_all_categories(category_counts: dict[str, int]) -> Generator[dict, None, None]:
    """
    Crawl multiple categories with specified counts.
    Yields progress updates for each category.
    """
    all_articles = []

    for category, count in category_counts.items():
        yield {
            "type": "status",
            "message": f"Starting crawl for {category} ({count} articles)...",
            "category": category,
        }

        category_articles = []
        for update in crawl_category(category, count):
            if update["type"] == "article":
                category_articles.append(update["data"])
            yield update

        all_articles.extend(category_articles)

    yield {
        "type": "final",
        "total_articles": len(all_articles),
        "articles": all_articles,
    }
