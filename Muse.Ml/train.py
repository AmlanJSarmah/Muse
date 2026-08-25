import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_PATH = "data/movies.csv"
MODEL_PATH = "model.joblib"


# Feature weights
TITLE_WEIGHT = 1
GENRE_WEIGHT = 3
ARTIST_WEIGHT = 2

print("Loading movie dataset...")

df = pd.read_csv(DATA_PATH)

required_columns = [
    "MovieId",
    "Title",
    "Year",
    "Genres",
    "Artists"
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

for column in [
    "MovieId",
    "Title",
    "Genres",
    "Artists"
]:

    df[column] = (
        df[column]
        .fillna("")
        .astype(str)
        .str.strip()
    )

df = df[
    df["MovieId"] != ""
]

df = df[
    df["Title"] != ""
]

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

def parse_list(value):

    if not value:
        return []

    return [
        item.strip()
        for item in str(value).split("|")
        if item.strip()
    ]

def create_features(row):

    title = row["Title"]

    genres = parse_list(
        row["Genres"]
    )

    artists = parse_list(
        row["Artists"]
    )


    title_features = " ".join(
        [title] * TITLE_WEIGHT
    )


    genre_features = " ".join(
        genres * GENRE_WEIGHT
    )


    artist_features = " ".join(
        artists * ARTIST_WEIGHT
    )


    return (
        title_features
        + " "
        + genre_features
        + " "
        + artist_features
    )


df["Features"] = df.apply(
    create_features,
    axis=1
)

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

print("Calculating cosine similarity...")

similarity_matrix = cosine_similarity(
    tfidf_matrix
)

model = {

    "movies": df[
        [
            "MovieId",
            "Title",
            "Year",
            "Genres",
            "Artists"
        ]
    ],

    "vectorizer":
        vectorizer,

    "tfidf_matrix":
        tfidf_matrix,

    "similarity_matrix":
        similarity_matrix,

    "weights":
    {
        "title": TITLE_WEIGHT,
        "genre": GENRE_WEIGHT,
        "artist": ARTIST_WEIGHT
    }
}


joblib.dump(
    model,
    MODEL_PATH
)

print()
print("--------------------------------------------")
print("MUSE ML MODEL TRAINED")
print("--------------------------------------------")
print(f"Movies: {len(df)}")
print(
    f"Features: {tfidf_matrix.shape[1]}"
)
print(
    f"Title weight: {TITLE_WEIGHT}"
)
print(
    f"Genre weight: {GENRE_WEIGHT}"
)
print(
    f"Artist weight: {ARTIST_WEIGHT}"
)
print(
    f"Model saved: {MODEL_PATH}"
)
print("--------------------------------------------")