import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

CSV_PATH = "data/movies.csv"
MODEL_PATH = "model.joblib"

print("Loading movie dataset...")

movies = pd.read_csv(CSV_PATH)

required_columns = [
    "MovieId",
    "MovieName",
    "Year",
    "Genres",
    "Artists"
]

for column in required_columns:

    if column not in movies.columns:
        raise ValueError(
            f"Missing required column: {column}"
        )

movies["MovieName"] = (
    movies["MovieName"]
    .fillna("")
    .astype(str)
)

movies["Genres"] = (
    movies["Genres"]
    .fillna("")
    .astype(str)
)

movies["Artists"] = (
    movies["Artists"]
    .fillna("")
    .astype(str)
)

movies["Year"] = (
    pd.to_numeric(
        movies["Year"],
        errors="coerce"
    )
    .fillna(0)
    .astype(int)
)

movies["combined_features"] = (
    movies["MovieName"]
    + " "
    + movies["Genres"].str.replace("|", " ", regex=False)
    + " "
    + movies["Artists"].str.replace("|", " ", regex=False)
)

print("Training TF-IDF model...")

vectorizer = TfidfVectorizer(
    stop_words="english"
)

tfidf_matrix = vectorizer.fit_transform(
    movies["combined_features"]
)

print("Calculating similarity matrix...")

similarity_matrix = cosine_similarity(
    tfidf_matrix
)

model = {
    "movies": movies,
    "vectorizer": vectorizer,
    "tfidf_matrix": tfidf_matrix,
    "similarity_matrix": similarity_matrix
}

joblib.dump(
    model,
    MODEL_PATH
)


print(
    f"Model saved to {MODEL_PATH}"
)

print(
    f"Trained on {len(movies)} movies."
)