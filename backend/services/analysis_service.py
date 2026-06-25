import pandas as pd
from collections import Counter
from typing import Any
import ast
import logging

logger = logging.getLogger(__name__)


def compute_data_understanding(articles: list[dict]) -> dict:
    """
    Compute automatic data understanding metrics from a list of article dicts.
    """
    if not articles:
        return {
            "total_rows": 0,
            "duplicate_count": 0,
            "null_count": 0,
            "avg_title_length": 0,
            "category_distribution": {},
            "top_frequent_words": [],
        }

    df = pd.DataFrame(articles)

    total_rows = len(df)
    duplicate_count = int(df.duplicated(subset=["judul_berita"]).sum()) if "judul_berita" in df.columns else 0
    null_count = int(df.isnull().sum().sum())

    avg_title_length = 0
    if "judul_berita" in df.columns:
        avg_title_length = round(df["judul_berita"].str.len().mean(), 2)

    category_distribution = {}
    if "label" in df.columns:
        category_distribution = df["label"].value_counts().to_dict()

    # Top frequent words from preprocessed data
    top_frequent_words = []
    if "judul_bersih" in df.columns:
        all_words = " ".join(df["judul_bersih"].dropna().astype(str)).split()
        word_counts = Counter(all_words).most_common(20)
        top_frequent_words = [{"word": w, "count": c} for w, c in word_counts]
    elif "judul_berita" in df.columns:
        all_words = " ".join(df["judul_berita"].dropna().astype(str).str.lower()).split()
        word_counts = Counter(all_words).most_common(20)
        top_frequent_words = [{"word": w, "count": c} for w, c in word_counts]

    return {
        "total_rows": total_rows,
        "duplicate_count": duplicate_count,
        "null_count": null_count,
        "avg_title_length": avg_title_length,
        "category_distribution": {str(k): int(v) for k, v in category_distribution.items()},
        "top_frequent_words": top_frequent_words,
    }


def compute_eda(articles: list[dict]) -> dict:
    """
    Compute exploratory data analysis metrics.
    """
    if not articles:
        return {
            "category_distribution": [],
            "word_cloud_data": [],
            "title_length_histogram": [],
            "top_tokens": [],
            "dataset_preview": [],
        }

    df = pd.DataFrame(articles)

    # Category distribution for chart
    category_dist = []
    if "label" in df.columns:
        counts = df["label"].value_counts()
        category_dist = [{"name": str(k), "value": int(v)} for k, v in counts.items()]

    # Word cloud data
    word_cloud_data = []
    text_col = "judul_bersih" if "judul_bersih" in df.columns else "judul_berita"
    if text_col in df.columns:
        all_words = " ".join(df[text_col].dropna().astype(str).str.lower()).split()
        word_counts = Counter(all_words).most_common(80)
        word_cloud_data = [{"text": w, "value": c} for w, c in word_counts]

    # Title length histogram
    title_length_histogram = []
    if "judul_berita" in df.columns:
        lengths = df["judul_berita"].str.len()
        bins = pd.cut(lengths, bins=10)
        hist = bins.value_counts().sort_index()
        title_length_histogram = [
            {"range": str(interval), "count": int(count)}
            for interval, count in hist.items()
        ]

    # Top tokens (from preprocessed data)
    top_tokens = []
    if "judul_bersih" in df.columns:
        all_tokens = " ".join(df["judul_bersih"].dropna().astype(str)).split()
        token_counts = Counter(all_tokens).most_common(30)
        top_tokens = [{"token": t, "count": c} for t, c in token_counts]

    # Dataset preview (first 10 rows)
    preview_cols = [c for c in ["tanggal", "judul_berita", "label", "judul_bersih", "jumlah_kata"] if c in df.columns]
    dataset_preview = df[preview_cols].head(10).to_dict(orient="records")

    return {
        "category_distribution": category_dist,
        "word_cloud_data": word_cloud_data,
        "title_length_histogram": title_length_histogram,
        "top_tokens": top_tokens,
        "dataset_preview": dataset_preview,
    }


def generate_insights(articles: list[dict], training_results: list[dict]) -> list[dict]:
    """
    Generate automatic insights from the dataset and training results.
    """
    insights = []

    if articles:
        df = pd.DataFrame(articles)

        # Largest category
        if "label" in df.columns:
            largest = df["label"].value_counts()
            if len(largest) > 0:
                insights.append({
                    "icon": "📊",
                    "title": "Largest Category",
                    "description": f"'{largest.index[0]}' is the largest category with {largest.iloc[0]} articles ({largest.iloc[0]/len(df)*100:.1f}% of total).",
                    "type": "info",
                })

                smallest = largest.index[-1]
                insights.append({
                    "icon": "📉",
                    "title": "Smallest Category",
                    "description": f"'{smallest}' is the smallest category with {largest.iloc[-1]} articles. Consider collecting more data for balance.",
                    "type": "warning",
                })

        # Average title length
        if "judul_berita" in df.columns:
            avg_len = df["judul_berita"].str.len().mean()
            insights.append({
                "icon": "📝",
                "title": "Average Title Length",
                "description": f"Average news title is {avg_len:.0f} characters long. {'Titles are quite descriptive.' if avg_len > 50 else 'Titles tend to be concise.'}",
                "type": "info",
            })

        # Most common terms
        text_col = "judul_bersih" if "judul_bersih" in df.columns else "judul_berita"
        if text_col in df.columns:
            all_words = " ".join(df[text_col].dropna().astype(str).str.lower()).split()
            top_words = Counter(all_words).most_common(5)
            top_str = ", ".join([f"'{w}' ({c}x)" for w, c in top_words])
            insights.append({
                "icon": "🔤",
                "title": "Most Common Terms",
                "description": f"Top terms: {top_str}",
                "type": "info",
            })

        # Word count stats
        if "jumlah_kata" in df.columns:
            avg_words = df["jumlah_kata"].dropna().mean()
            insights.append({
                "icon": "📊",
                "title": "Average Word Count",
                "description": f"After preprocessing, titles contain an average of {avg_words:.1f} words.",
                "type": "info",
            })

    # Training results insights
    if training_results:
        best = max(training_results, key=lambda x: x.get("accuracy", 0))
        worst = min(training_results, key=lambda x: x.get("accuracy", 0))

        insights.append({
            "icon": "🏆",
            "title": "Best Performing Model",
            "description": f"{best['model_name']} achieves the highest accuracy of {best['accuracy']*100:.2f}% with F1-score of {best.get('f1_score', 0)*100:.2f}%.",
            "type": "success",
        })

        insights.append({
            "icon": "⚡",
            "title": "Model Comparison",
            "description": f"Performance gap between best ({best['model_name']}: {best['accuracy']*100:.2f}%) and weakest ({worst['model_name']}: {worst['accuracy']*100:.2f}%) is {(best['accuracy']-worst['accuracy'])*100:.2f} percentage points.",
            "type": "info",
        })

        # Model strengths
        for result in training_results:
            if result.get("accuracy", 0) > 0.9:
                insights.append({
                    "icon": "✅",
                    "title": f"{result['model_name']} Strength",
                    "description": f"Achieves over 90% accuracy. Well-suited for production deployment.",
                    "type": "success",
                })
            elif result.get("accuracy", 0) < 0.7:
                insights.append({
                    "icon": "⚠️",
                    "title": f"{result['model_name']} Limitation",
                    "description": f"Below 70% accuracy ({result['accuracy']*100:.2f}%). May struggle with similar categories.",
                    "type": "warning",
                })

    if not insights:
        insights.append({
            "icon": "ℹ️",
            "title": "Getting Started",
            "description": "Import or crawl data, run preprocessing, and train models to generate insights.",
            "type": "info",
        })

    return insights
