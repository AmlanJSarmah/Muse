from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

import joblib
import pandas as pd


# ============================================================
# Configuration
# ============================================================

MODEL_PATH = "model.joblib"


# ============================================================
# Load trained model
# ============================================================

print("Loading MUSE ML model...")

model = joblib.load(MODEL_PATH)

movies_df: pd.DataFrame = model["movies"]

similarity_matrix = model["similarity_matrix"]


# Make absolutely sure MovieId is treated as a string
movies_df["MovieId"] = movies_df["MovieId"].astype(str)


print(f"Loaded model with {len(movies_df)} movies.")


# ============================================================
# FastAPI
# ============================================================

app = FastAPI(
    title="MUSE ML API",
    version="1.0.0"
)


# ============================================================
# Request Models
# ============================================================

class Movie(BaseModel):
    movieId: str
    movieName: str
    year: int
    genres: List[str]


class MovieRequest(BaseModel):
    movies: List[Movie]


# ============================================================
# Response Models
# ============================================================

class RecommendedMovie(BaseModel):
    movieId: str
    movieName: str
    year: int
    genres: List[str]
    score: float


class MovieRecommendation(BaseModel):
    movieId: str
    movieName: str
    recommendations: List[RecommendedMovie]


class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]


# ============================================================
# Health Check
# ============================================================

@app.get("/")
def home():

    return {
        "message": "MUSE ML API is running",
        "model": "TF-IDF + Cosine Similarity",
        "version": "1.0.0",
        "movies": len(movies_df)
    }


# ============================================================
# Recommendation Endpoint
# ============================================================

@app.post(
    "/recommend",
    response_model=RecommendationResponse
)
def recommend(request: MovieRequest):

    # --------------------------------------------------------
    # Empty request
    # --------------------------------------------------------

    if not request.movies:

        return {
            "recommendations": []
        }


    # --------------------------------------------------------
    # Create:
    #
    # MovieId -> row index
    # --------------------------------------------------------

    movie_indexes = {
        str(movie_id): index
        for index, movie_id
        in enumerate(movies_df["MovieId"])
    }


    results = []


    # --------------------------------------------------------
    # Process requested movies
    # --------------------------------------------------------

    for requested_movie in request.movies:

        movie_id = str(
            requested_movie.movieId
        )


        # ----------------------------------------------------
        # Movie does not exist in trained model
        # ----------------------------------------------------

        if movie_id not in movie_indexes:

            continue


        movie_index = movie_indexes[movie_id]


        # ----------------------------------------------------
        # Get similarity scores
        # ----------------------------------------------------

        scores = similarity_matrix[movie_index]


        # ----------------------------------------------------
        # Sort from most similar to least similar
        # ----------------------------------------------------

        ranked_indexes = scores.argsort()[::-1]


        recommendations = []


        # ----------------------------------------------------
        # Get top recommendations
        # ----------------------------------------------------

        for index in ranked_indexes:

            # Don't recommend the movie itself
            if index == movie_index:
                continue


            score = float(
                scores[index]
            )


            # Ignore zero similarity
            if score <= 0:
                continue


            recommended_movie = movies_df.iloc[index]


            # ------------------------------------------------
            # Convert genres from CSV string into array
            #
            # Example:
            #
            # "Crime Drama Thriller"
            #
            # becomes:
            #
            # ["Crime", "Drama", "Thriller"]
            # ------------------------------------------------

            genres_string = str(
                recommended_movie["Genres"]
            )

            genres = genres_string.split()

            if "Science" in genres and "Fiction" in genres:

                science_index = genres.index("Science")

                fiction_index = genres.index("Fiction")

                if fiction_index == science_index + 1:

                    genres = [
                        genre
                        for i, genre in enumerate(genres)
                        if i not in [science_index, fiction_index]
                    ]

                    genres.insert(
                        science_index,
                        "Science Fiction"
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

                "score": round(
                    score,
                    4
                )
            })


            # Top 10
            if len(recommendations) >= 10:
                break


        # ----------------------------------------------------
        # Add results
        # ----------------------------------------------------

        results.append({

            "movieId": movie_id,

            "movieName": requested_movie.movieName,

            "recommendations": recommendations
        })


    # ========================================================
    # Return
    # ========================================================

    return {
        "recommendations": results
    }