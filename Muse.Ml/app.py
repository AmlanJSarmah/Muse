from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

import joblib
import pandas as pd

MODEL_PATH = "model.joblib"

MAX_RECOMMENDATIONS = 10

MIN_SIMILARITY = 0.0

print("Loading MUSE ML model...")

model = joblib.load(
    MODEL_PATH
)

movies_df: pd.DataFrame = model[
    "movies"
]

similarity_matrix = model[
    "similarity_matrix"
]


movies_df["MovieId"] = (
    movies_df["MovieId"]
    .astype(str)
    .str.strip()
)


print(
    f"Loaded model with {len(movies_df)} movies."
)

app = FastAPI(
    title="MUSE ML API",
    version="2.0.0"
)

class Movie(BaseModel):

    movieId: str

    movieName: str

    year: int

    genres: List[str]

    artists: List[str] = []


class MovieRequest(BaseModel):

    movies: List[Movie]

class RecommendedMovie(BaseModel):

    movieId: str

    movieName: str

    year: int

    genres: List[str]

    artists: List[str]

    score: float


class MovieRecommendation(BaseModel):

    movieId: str

    movieName: str

    recommendations: List[RecommendedMovie]


class RecommendationResponse(BaseModel):

    recommendations: List[MovieRecommendation]

def split_values(value):

    if value is None:
        return []

    value = str(value).strip()

    if not value:
        return []

    return [
        item.strip()
        for item in value.split("|")
        if item.strip()
    ]

@app.get("/")
def home():

    return {
        "message": "MUSE ML API is running",

        "model": "TF-IDF + Cosine Similarity",

        "version": "2.0.0",

        "movies": len(movies_df)
    }

@app.post(
    "/recommend",
    response_model=RecommendationResponse
)
def recommend(
    request: MovieRequest
):

    if not request.movies:

        return {
            "recommendations": []
        }


    movie_indexes = {

        str(movie_id): index

        for index, movie_id

        in enumerate(
            movies_df["MovieId"]
        )
    }


    results = []

    for requested_movie in request.movies:

        movie_id = (
            str(requested_movie.movieId)
            .strip()
        )


        if movie_id not in movie_indexes:

            continue


        movie_index = (
            movie_indexes[movie_id]
        )


        scores = similarity_matrix[
            movie_index
        ]


        ranked_indexes = (
            scores.argsort()[::-1]
        )


        recommendations = []


        for index in ranked_indexes:

            if index == movie_index:
                continue


            score = float(
                scores[index]
            )


            if score <= MIN_SIMILARITY:
                continue


            recommended_movie = (
                movies_df.iloc[index]
            )


            genres = split_values(
                recommended_movie["Genres"]
            )


            artists = split_values(
                recommended_movie["Artists"]
            )


            recommendations.append({

                "movieId": str(
                    recommended_movie["MovieId"]
                ),

                "movieName": str(
                    recommended_movie["Title"]
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
            ) >= MAX_RECOMMENDATIONS:

                break


        results.append({

            "movieId":
                movie_id,

            "movieName":
                requested_movie.movieName,

            "recommendations":
                recommendations
        })


    return {
        "recommendations": results
    }