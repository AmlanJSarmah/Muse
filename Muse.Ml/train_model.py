import pandas as pd
import joblib
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_PATH = Path(__file__).parent / "data" / "movies_seed.csv"
MODEL_PATH = Path(__file__).parent / "model" / "similarity_model.joblib"


def build_model():
    df = pd.read_csv(DATA_PATH)

    required = {"MovieId", "Title", "Genres", "Artists"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Input data is missing required columns: {missing}")

    df["combined_features"] = df["Genres"].fillna("") + " " + df["Artists"].fillna("")

    vectorizer = TfidfVectorizer(token_pattern=r"[a-zA-Z0-9]+")
    tfidf_matrix = vectorizer.fit_transform(df["combined_features"])

    similarity_matrix = cosine_similarity(tfidf_matrix)

    artifact = {
        "movies": df,
        "similarity_matrix": similarity_matrix,
        "vectorizer": vectorizer,
    }

    MODEL_PATH.parent.mkdir(exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    print(f"Model trained on {len(df)} movies and saved to {MODEL_PATH}")


if __name__ == "__main__":
    build_model()
