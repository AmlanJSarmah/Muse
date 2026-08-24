from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager

from models import RecommendationRequest, RecommendationResponse
import recommender


@asynccontextmanager
async def lifespan(app: FastAPI):
    recommender.load_model()
    yield


app = FastAPI(title="Muse ML Service - Movie Recommendations", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/recommendations/movies", response_model=RecommendationResponse)
def get_movie_recommendations(request: RecommendationRequest):
    if request.movie_id is not None:
        results = recommender.recommend(request.movie_id, top_n=request.top_n)
        if results:
            return RecommendationResponse(source="similarity", recommendations=results)

        if request.genres:
            results = recommender.recommend_by_genres(request.genres, top_n=request.top_n)
            return RecommendationResponse(source="genre_fallback", recommendations=results)

        raise HTTPException(
            status_code=404,
            detail=f"movie_id {request.movie_id} not found in trained model and no genres provided as fallback",
        )

    if request.genres:
        results = recommender.recommend_by_genres(request.genres, top_n=request.top_n)
        return RecommendationResponse(source="genre_fallback", recommendations=results)

    raise HTTPException(status_code=400, detail="Provide either movie_id or genres")
