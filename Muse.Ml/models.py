from pydantic import BaseModel
from typing import Optional


class RecommendationRequest(BaseModel):
    movie_id: Optional[int] = None
    genres: Optional[list[str]] = None
    top_n: int = 5


class RecommendedMovie(BaseModel):
    movie_id: int
    title: str
    score: float


class RecommendationResponse(BaseModel):
    source: str  # "similarity" or "genre_fallback"
    recommendations: list[RecommendedMovie]