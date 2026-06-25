import joblib
import numpy as np
import logging
from pathlib import Path
from config import settings
from services.preprocessing_service import preprocess_text

logger = logging.getLogger(__name__)

# Cached model and vectorizer
_model = None
_vectorizer = None


def _load_model():
    global _model, _vectorizer

    model_path = Path(settings.BEST_MODEL_PATH)
    vectorizer_path = Path(settings.TFIDF_VECTORIZER_PATH)

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    if not vectorizer_path.exists():
        raise FileNotFoundError(f"Vectorizer file not found: {vectorizer_path}")

    _model = joblib.load(str(model_path))
    _vectorizer = joblib.load(str(vectorizer_path))
    logger.info("Model and vectorizer loaded successfully")


def reload_model():
    """Force reload model and vectorizer from disk."""
    global _model, _vectorizer
    _model = None
    _vectorizer = None
    _load_model()


def predict(text: str) -> dict:
    """
    Predict the category of a news title.
    Returns prediction with confidence score.
    """
    global _model, _vectorizer

    if _model is None or _vectorizer is None:
        _load_model()

    # Preprocess the input
    preprocessed = preprocess_text(text)
    clean_text = preprocessed["judul_bersih"]

    if not clean_text.strip():
        return {
            "input_text": text,
            "preprocessed_text": clean_text,
            "predicted_label": "Unknown",
            "confidence": 0.0,
            "model_used": "N/A",
        }

    # Vectorize
    X = _vectorizer.transform([clean_text])

    # Predict
    predicted_label = _model.predict(X)[0]

    # Get confidence score
    confidence = None
    model_name = type(_model).__name__

    try:
        if hasattr(_model, "predict_proba"):
            proba = _model.predict_proba(X)[0]
            confidence = float(np.max(proba))
        elif hasattr(_model, "decision_function"):
            decision = _model.decision_function(X)[0]
            if isinstance(decision, np.ndarray):
                # Multi-class: softmax-like normalization
                exp_dec = np.exp(decision - np.max(decision))
                proba = exp_dec / exp_dec.sum()
                confidence = float(np.max(proba))
            else:
                confidence = float(abs(decision))
    except Exception as e:
        logger.warning(f"Could not compute confidence: {e}")

    return {
        "input_text": text,
        "preprocessed_text": clean_text,
        "predicted_label": str(predicted_label),
        "confidence": confidence,
        "model_used": model_name,
    }
