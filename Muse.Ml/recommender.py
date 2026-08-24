from pathlib import Path
import joblib

MODEL_PATH = Path(__file__).parent / "model" / "similarity_model.joblib"

_artifact = None


def load_model():
    global _artifact
    if _artifact is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"No model found at {MODEL_PATH}. Run train_model.py first."
            )
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


def recommend(movie_id: int, top_n: int = 5):
    """
    Returns up to top_n movies most similar to movie_id, ranked by
    cosine similarity over genre/artist tags. Empty list if movie_id
    isn't in the trained dataset.
    """
    artifact = load_model()
    movies = artifact["movies"]
    similarity_matrix = artifact["similarity_matrix"]

    matches = movies.index[movies["MovieId"] == movie_id]
    if len(matches) == 0:
        return []

    idx = matches[0]
    scores = list(enumerate(similarity_matrix[idx]))
    scores = [s for s in scores if s[0] != idx]
    scores.sort(key=lambda x: x[1], reverse=True)
    top_matches = scores[:top_n]

    results = []
    for match_idx, score in top_matches:
        row = movies.iloc[match_idx]
        results.append(
            {
                "movie_id": int(row["MovieId"]),
                "title": row["Title"],
                "score": round(float(score), 4),
            }
        )
    return results


def recommend_by_genres(genres: list[str], top_n: int = 5):
    """
    Fallback for a movie not yet in the trained set (e.g. just added
    via the "add movies through public sources" flow): rank all
    movies by how many of the given genres they share.
    """
    artifact = load_model()
    movies = artifact["movies"]

    def overlap_score(row_genres: str) -> int:
        row_set = set(str(row_genres).lower().split())
        return len(row_set & {g.lower() for g in genres})

    scored = movies.copy()
    scored["score"] = scored["Genres"].apply(overlap_score)
    scored = scored[scored["score"] > 0].sort_values("score", ascending=False).head(top_n)

    return [
        {"movie_id": int(r["MovieId"]), "title": r["Title"], "score": int(r["score"])}
        for _, r in scored.iterrows()
    ]
