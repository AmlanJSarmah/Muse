from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from typing import List

import joblib
import pandas as pd
import re

MODEL_PATH = "model.joblib"

print("Loading MUSE ML model...")

model = joblib.load(MODEL_PATH)

movies_df: pd.DataFrame = model["movies"]

similarity_matrix = model["similarity_matrix"]


print(
    f"Loaded model with {len(movies_df)} movies."
)

def normalize_movie_name(name: str) -> str:

    if not name:
        return ""

    name = name.strip().lower()

    name = re.sub(
        r"[^a-z0-9\s]",
        " ",
        name
    )

    name = re.sub(
        r"\s+",
        " ",
        name
    )

    return name.strip()

movies_df["_normalized_name"] = (
    movies_df["MovieName"]
    .astype(str)
    .apply(normalize_movie_name)
)


movie_indexes = {}

for index, row in movies_df.iterrows():

    key = (
        row["_normalized_name"],
        int(row["Year"])
    )

    movie_indexes[key] = index


app = FastAPI(
    title="MUSE ML API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)

class Movie(BaseModel):

    movieId: str

    movieTitle: str

    year: int

    genres: List[str] = Field(
        default_factory=list
    )

    artists: List[str] = Field(
        default_factory=list
    )


class MovieInfoRequest(BaseModel):

    created: List[Movie] = Field(
        default_factory=list
    )

    saved: List[Movie] = Field(
        default_factory=list
    )

@app.get("/")
def home():

    return {
        "message": "MUSE ML API is running",

        "model": "TF-IDF + Cosine Similarity",

        "version": "1.0.0",

        "movies": len(movies_df)
    }



@app.post("/recommend")
def recommend(
    request: MovieInfoRequest
):

    movies = (
        request.created
        + request.saved
    )


    if not movies:

        return {
            "recommendations": []
        }

    unique_movies = {}

    for movie in movies:

        key = (
            normalize_movie_name(
                movie.movieTitle
            ),
            movie.year
        )

        unique_movies[key] = movie


    movies = list(
        unique_movies.values()
    )


    results = []

    for requested_movie in movies:

        normalized_name = (
            normalize_movie_name(
                requested_movie.movieTitle
            )
        )

        key = (
            normalized_name,
            requested_movie.year
        )

        if key not in movie_indexes:

            continue


        movie_index = movie_indexes[key]

        scores = similarity_matrix[
            movie_index
        ]

        ranked_indexes = (
            scores
            .argsort()[::-1]
        )


        recommendations = []

        for index in ranked_indexes:

            if index == movie_index:

                continue


            recommended_movie = (
                movies_df.iloc[index]
            )


            score = float(
                scores[index]
            )

            if score <= 0:

                continue

            genres = []

            if pd.notna(
                recommended_movie["Genres"]
            ):

                genres = [
                    genre.strip()
                    for genre
                    in str(
                        recommended_movie["Genres"]
                    ).split("|")
                    if genre.strip()
                ]

            artists = []

            if pd.notna(
                recommended_movie["Artists"]
            ):

                artists = [
                    artist.strip()
                    for artist
                    in str(
                        recommended_movie["Artists"]
                    ).split("|")
                    if artist.strip()
                ]

            recommendations.append({

                "movieName": str(
                    recommended_movie["MovieName"]
                ),

                "year": int(
                    recommended_movie["Year"]
                ),

                "genres": genres,

                "artists": artists,

                "score": round(
                    score,
                    4
                )
            })

            if len(
                recommendations
            ) >= 10:

                break


        results.append({

            "movieId": requested_movie.movieId,

            "movieName": requested_movie.movieTitle,

            "recommendations": recommendations

        })

    return {

        "recommendations": results

    }