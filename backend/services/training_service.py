import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
from sklearn.calibration import CalibratedClassifierCV
import joblib
import uuid
import logging
from config import settings

logger = logging.getLogger(__name__)


def train_models(
    articles: list[dict],
    max_features: int = 10000,
    ngram_range: tuple = (1, 2),
    sublinear_tf: bool = True,
    min_df: int = 2,
    max_df: float = 0.95,
) -> dict:
    """
    Train multiple classification models on preprocessed news data.
    Returns training results for all models.
    """
    session_id = str(uuid.uuid4())[:8]

    # Prepare data
    df = pd.DataFrame(articles)

    text_col = "judul_bersih" if "judul_bersih" in df.columns else "judul_berita"
    df = df.dropna(subset=[text_col, "label"])
    df = df[df[text_col].str.strip() != ""]

    if len(df) < 50:
        raise ValueError(f"Not enough data for training. Found {len(df)} valid rows, need at least 50.")

    X_text = df[text_col].values
    y = df["label"].values

    # TF-IDF Vectorization
    logger.info(f"Building TF-IDF with max_features={max_features}, ngram_range={ngram_range}")
    tfidf = TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        sublinear_tf=sublinear_tf,
        min_df=min_df,
        max_df=max_df,
    )
    X = tfidf.fit_transform(X_text)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Define models
    models = {
        "Multinomial Naive Bayes": MultinomialNB(alpha=1.0),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, C=1.0),
        "Linear SVM": CalibratedClassifierCV(LinearSVC(max_iter=2000, random_state=42)),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
    }

    results = []
    best_accuracy = 0
    best_model_name = ""
    best_model_obj = None

    labels = sorted(list(set(y)))

    for name, model in models.items():
        logger.info(f"Training {name}...")
        try:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
            rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
            f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
            cm = confusion_matrix(y_test, y_pred, labels=labels).tolist()
            cr = classification_report(y_test, y_pred, labels=labels, target_names=labels, output_dict=True, zero_division=0)

            result = {
                "model_name": name,
                "accuracy": float(acc),
                "precision": float(prec),
                "recall": float(rec),
                "f1_score": float(f1),
                "confusion_matrix": cm,
                "classification_report": cr,
                "is_best": False,
                "training_session_id": session_id,
            }
            results.append(result)

            if acc > best_accuracy:
                best_accuracy = acc
                best_model_name = name
                best_model_obj = model

            logger.info(f"{name}: Accuracy={acc:.4f}, F1={f1:.4f}")

        except Exception as e:
            logger.error(f"Error training {name}: {e}")
            results.append({
                "model_name": name,
                "accuracy": 0.0,
                "precision": 0.0,
                "recall": 0.0,
                "f1_score": 0.0,
                "confusion_matrix": [],
                "classification_report": {},
                "is_best": False,
                "training_session_id": session_id,
            })

    # Mark best model
    for r in results:
        if r["model_name"] == best_model_name:
            r["is_best"] = True

    # Save best model and vectorizer
    if best_model_obj is not None:
        model_path = settings.BEST_MODEL_PATH
        vectorizer_path = settings.TFIDF_VECTORIZER_PATH
        joblib.dump(best_model_obj, model_path)
        joblib.dump(tfidf, vectorizer_path)
        logger.info(f"Saved best model ({best_model_name}) to {model_path}")
        logger.info(f"Saved TF-IDF vectorizer to {vectorizer_path}")

    return {
        "results": results,
        "best_model": best_model_name,
        "best_accuracy": best_accuracy,
        "session_id": session_id,
        "labels": labels,
    }
