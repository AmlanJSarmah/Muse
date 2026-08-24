import os
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# Configuration
# ============================================================

DATA_PATH = "data/movies.csv"
MODEL_PATH = "model.joblib"


# ============================================================
# Load dataset
# ============================================================

print("Loading movie dataset...")

df = pd.read_csv(DATA_PATH)


# ============================================================
# Validate required columns
# ============================================================

required_columns = [
    "MovieId",
    "Title",
    "Year",
    "Genres"
]

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing columns in CSV: {missing_columns}"
    )


# ============================================================
# Clean data
# ============================================================

df["MovieId"] = df["MovieId"].astype(str)

df["Title"] = df["Title"].fillna("").astype(str)

df["Year"] = df["Year"].fillna("").astype(str)

df["Genres"] = df["Genres"].fillna("").astype(str)


# ============================================================
# Remove duplicate MovieIds
# ============================================================

before = len(df)

df = df.drop_duplicates(
    subset=["MovieId"],
    keep="first"
)

after = len(df)

if before != after:
    print(
        f"Removed {before - after} duplicate MovieIds."
    )


# ============================================================
# Remove duplicate titles
#
# This protects the recommendation system from accidentally
# having the same movie twice in the training data.
# ============================================================

before = len(df)

df = df.drop_duplicates(
    subset=["Title"],
    keep="first"
)

after = len(df)

if before != after:
    print(
        f"Removed {before - after} duplicate titles."
    )


# ============================================================
# Build feature text
#
# We use:
#
#   Title
#   Genres
#
# Year is deliberately NOT included as normal text because
# TF-IDF treating "2007" as a word doesn't provide useful
# movie similarity.
# ============================================================

def create_features(row):

    title = row["Title"]

    genres = row["Genres"]

    return f"{title} {genres}"


df["Features"] = df.apply(
    create_features,
    axis=1
)


# ============================================================
# Create TF-IDF model
# ============================================================

print("Training TF-IDF model...")

vectorizer = TfidfVectorizer(
    lowercase=True,

    stop_words="english",

    ngram_range=(1, 2),

    min_df=1
)


tfidf_matrix = vectorizer.fit_transform(
    df["Features"]
)


# ============================================================
# Calculate similarity matrix
# ============================================================

print("Calculating cosine similarity...")

similarity_matrix = cosine_similarity(
    tfidf_matrix
)


# ============================================================
# Save everything required for prediction
# ============================================================

model = {
    "movies": df[
        [
            "MovieId",
            "Title",
            "Year",
            "Genres"
        ]
    ],

    "vectorizer": vectorizer,

    "tfidf_matrix": tfidf_matrix,

    "similarity_matrix": similarity_matrix
}


joblib.dump(
    model,
    MODEL_PATH
)


# ============================================================
# Output information
# ============================================================

print()
print("--------------------------------------------")
print("MUSE ML MODEL TRAINED")
print("--------------------------------------------")
print(f"Movies: {len(df)}")
print(f"Features: {tfidf_matrix.shape[1]}")
print(f"Model saved: {MODEL_PATH}")
print("--------------------------------------------")