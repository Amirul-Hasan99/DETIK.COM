import re
import string
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
import logging

logger = logging.getLogger(__name__)

# Initialize Sastrawi components (singleton)
_stemmer_factory = StemmerFactory()
_stemmer = _stemmer_factory.create_stemmer()
_stopword_factory = StopWordRemoverFactory()
_stopword_remover = _stopword_factory.create_stop_word_remover()
_stopwords = set(_stopword_factory.get_stop_words())


def preprocess_text(text: str) -> dict:
    """
    Run the full NLP preprocessing pipeline on a text.
    Returns dict with preprocessed text, tokens, and word count.
    """
    if not text or not isinstance(text, str):
        return {"judul_bersih": "", "tokenisasi": "[]", "jumlah_kata": 0}

    original = text

    # Step 1: Lowercase
    text = text.lower()

    # Step 2: Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)

    # Step 3: Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))

    # Step 4: Remove numbers
    text = re.sub(r'\d+', '', text)

    # Step 5: Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # Step 6: Stopword removal (Sastrawi)
    text = _stopword_remover.remove(text)

    # Step 7: Indonesian stemming (Sastrawi)
    text = _stemmer.stem(text)

    # Step 8: Tokenization
    tokens = text.split()

    return {
        "judul_bersih": text,
        "tokenisasi": str(tokens),
        "jumlah_kata": len(tokens),
    }


def preprocess_batch(texts: list[dict]) -> list[dict]:
    """
    Process a batch of articles. Each dict should have 'id' and 'judul_berita'.
    Returns list of dicts with preprocessing results.
    """
    results = []
    total = len(texts)

    for i, item in enumerate(texts):
        try:
            preprocessed = preprocess_text(item.get("judul_berita", ""))
            results.append({
                "id": item["id"],
                "original": item.get("judul_berita", ""),
                **preprocessed,
            })
        except Exception as e:
            logger.error(f"Error preprocessing article {item.get('id')}: {e}")
            results.append({
                "id": item["id"],
                "original": item.get("judul_berita", ""),
                "judul_bersih": "",
                "tokenisasi": "[]",
                "jumlah_kata": 0,
            })

    return results


def get_preprocessing_comparison(original: str) -> dict:
    """
    Generate a step-by-step preprocessing comparison for display.
    """
    steps = []
    text = original

    # Step 1: Original
    steps.append({"step": "Original", "result": text})

    # Step 2: Lowercase
    text = text.lower()
    steps.append({"step": "Lowercase", "result": text})

    # Step 3: Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    steps.append({"step": "Remove URLs", "result": text})

    # Step 4: Remove Punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    steps.append({"step": "Remove Punctuation", "result": text})

    # Step 5: Remove Numbers
    text = re.sub(r'\d+', '', text)
    steps.append({"step": "Remove Numbers", "result": text})

    # Step 6: Clean whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    steps.append({"step": "Clean Whitespace", "result": text})

    # Step 7: Stopword Removal
    text = _stopword_remover.remove(text)
    steps.append({"step": "Stopword Removal", "result": text})

    # Step 8: Stemming
    text = _stemmer.stem(text)
    steps.append({"step": "Stemming", "result": text})

    # Step 9: Tokenization
    tokens = text.split()
    steps.append({"step": "Tokenization", "result": str(tokens)})

    return {
        "original": original,
        "final": text,
        "tokens": tokens,
        "word_count": len(tokens),
        "steps": steps,
    }
