import csv
import io
from typing import Any


def generate_csv(data: list[dict], columns: list[str] = None) -> str:
    """
    Generate CSV string from a list of dicts.
    """
    if not data:
        return ""

    if columns is None:
        columns = list(data[0].keys())

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=columns, extrasaction="ignore")
    writer.writeheader()

    for row in data:
        writer.writerow(row)

    return output.getvalue()


def export_raw_dataset(articles: list[dict]) -> str:
    """Export raw dataset as CSV."""
    columns = ["tanggal", "judul_berita", "url", "label"]
    return generate_csv(
        [{k: a.get(k, "") for k in columns} for a in articles],
        columns
    )


def export_preprocessed_dataset(articles: list[dict]) -> str:
    """Export preprocessed dataset as CSV."""
    columns = ["tanggal", "judul_berita", "url", "label", "judul_bersih", "tokenisasi", "jumlah_kata"]
    return generate_csv(
        [{k: a.get(k, "") for k in columns} for a in articles],
        columns
    )


def export_prediction_history(predictions: list[dict]) -> str:
    """Export prediction history as CSV."""
    columns = ["input_text", "preprocessed_text", "predicted_label", "confidence", "model_used", "created_at"]
    return generate_csv(
        [{k: p.get(k, "") for k in columns} for p in predictions],
        columns
    )
