# Muse API Documentation

Base URL (local dev): `http://localhost:5235`

All protected endpoints require a header:
```
Authorization: Bearer <token>
```
Tokens are obtained from `POST /api/auth/signin` and expire after 2 hours.

---

## Auth

### `POST /api/auth/signup`
Creates a new user account.

**Request**
```json
{
  "username": "aj",
  "email": "aj@example.com",
  "password": "SomeStrongPassword123!"
}
```

**Response — `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-08-23T18:41:02Z",
  "username": "aj",
  "email": "aj@example.com"
}
```

**Response — `409 Conflict`** (email or username already taken)
```json
{ "error": "An account with this email already exists." }
```

**Response — `400 Bad Request`** (validation failure — e.g. invalid email, password under 8 characters)
```json
{
  "errors": {
    "Email": ["The Email field is not a valid e-mail address."],
    "Password": ["The field Password must be a string with a minimum length of 8."]
  }
}
```

---

### `POST /api/auth/signin`
Authenticates an existing user and issues a JWT.

**Request**
```json
{
  "email": "aj@example.com",
  "password": "SomeStrongPassword123!"
}
```

**Response — `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-08-23T18:41:02Z",
  "username": "aj",
  "email": "aj@example.com"
}
```

**Response — `401 Unauthorized`** (wrong email or password — deliberately identical message for both, to avoid revealing which one was wrong)
```json
{ "error": "Invalid email or password." }
```

---

## Movie / Song Lookup

### `GET /app/songs?title={movieTitle}`
Fetches a movie's soundtrack from MusicBrainz. **Read-only — nothing is saved to the database.**

**Auth required:** yes

**Response — `200 OK`**
```json
{
  "movie": "There Will Be Blood",
  "album": "There Will Be Blood (Original Motion Picture Soundtrack)",
  "songs": [
    {
      "title": "Open Spaces",
      "artist": "Jonny Greenwood",
      "genres": ["soundtrack", "orchestral", "modern classical"]
    },
    {
      "title": "Future Markets",
      "artist": "Jonny Greenwood",
      "genres": ["soundtrack", "orchestral", "modern classical"]
    }
  ]
}
```

**Response — `404 Not Found`** (no soundtrack exists on MusicBrainz for this title)
```json
{ "error": "No soundtrack found for 'Some Nonexistent Movie'." }
```

**Response — `400 Bad Request`** (missing `title` query param)
```json
{
  "errors": { "title": ["The title field is required."] }
}
```

**Response — `401 Unauthorized`** (missing or invalid token)
```json
{ }
```
*(ASP.NET's default JWT challenge returns an empty 401 body with a `WWW-Authenticate` header — this is standard framework behavior, not a bug.)*

---

### `POST /app/songs/save?title={movieTitle}`
Fetches the soundtrack (same as above) **and persists it**: creates/reuses `Movie`, `Artist`, `Genre`, and `Song` rows, then creates a new `Playlist` owned by the signed-in user.

**Auth required:** yes — the signed-in user becomes the playlist's `CreatorId`

**Response — `200 OK`**
```json
{
  "playlistId": "3f29a1c4-8e2d-4b1a-9c3e-7d5f6a8b9c0d",
  "movie": "There Will Be Blood",
  "album": "There Will Be Blood (Original Motion Picture Soundtrack)",
  "songCount": 8
}
```

**Response — `404 Not Found`** (no soundtrack found — nothing is saved)
```json
{ "error": "No soundtrack found for 'Some Nonexistent Movie'." }
```

**Note:** Currently, every call creates a **new** playlist for the movie, even if one already exists — there's no dedupe-on-generate yet.

---

## Playlists

### `GET /api/playlists/search?movieTitle={movieTitle}`
Returns all **public** playlists for a movie. Used to populate the search results screen (existing playlists + a "Generate" button).

**Auth required:** yes

**Response — `200 OK`** (playlists exist)
```json
{
  "movie": "There Will Be Blood",
  "playlists": [
    {
      "id": "3f29a1c4-8e2d-4b1a-9c3e-7d5f6a8b9c0d",
      "name": "There Will Be Blood (Original Motion Picture Soundtrack)",
      "creatorUsername": "aj",
      "source": "system",
      "songCount": 8,
      "createdAt": "2026-08-23T16:40:11Z"
    }
  ]
}
```

**Response — `200 OK`** (no public playlists exist yet — frontend should show only the Generate button)
```json
{
  "movie": "There Will Be Blood",
  "playlists": []
}
```

---

### `GET /api/playlists/{id}`
Loads the full contents of one playlist — songs, artists, genres, and YouTube links (if fetched).

**Auth required:** yes. Private playlists are only visible to their creator.

**Response — `200 OK`**
```json
{
  "id": "3f29a1c4-8e2d-4b1a-9c3e-7d5f6a8b9c0d",
  "name": "There Will Be Blood (Original Motion Picture Soundtrack)",
  "description": "Auto-generated soundtrack for There Will Be Blood",
  "isPublic": true,
  "movieTitle": "There Will Be Blood",
  "songs": [
    {
      "title": "Open Spaces",
      "artist": "Jonny Greenwood",
      "genres": ["soundtrack", "orchestral"],
      "youtubeUrl": null
    }
  ]
}
```
*(`youtubeUrl` is `null` until the separate YouTube-link endpoint has been run for this song.)*

**Response — `404 Not Found`**
```json
"Playlist not found."
```

**Response — `403 Forbidden`** (playlist is private and you're not the creator)
```json
{ }
```

---

### `POST /api/playlists/{id}/save`
Bookmarks (saves) an existing playlist to the current user's account.

**Auth required:** yes

**Response — `200 OK`**
```json
{ "message": "Playlist saved." }
```

**Response — `409 Conflict`** (already saved by this user)
```json
"You've already saved this playlist."
```

**Response — `404 Not Found`**
```json
"Playlist not found."
```

---

### `DELETE /api/playlists/{id}/save`
Removes the playlist from the current user's saved/bookmarked list. Does **not** delete the underlying playlist — it remains visible to everyone else (and to its creator).

**Auth required:** yes

**Response — `200 OK`**
```json
{ "message": "Playlist removed from your saved list." }
```

**Response — `404 Not Found`** (wasn't saved by this user to begin with)
```json
"This playlist isn't in your saved list."
```

---

### `PATCH /api/playlists/{id}/visibility`
Toggles a playlist's public/private status. **Creator-only.**

**Auth required:** yes

**Request**
```json
{ "isPublic": false }
```

**Response — `200 OK`**
```json
{
  "playlistId": "3f29a1c4-8e2d-4b1a-9c3e-7d5f6a8b9c0d",
  "isPublic": false
}
```

**Response — `403 Forbidden`** (you didn't create this playlist)
```json
{ }
```

**Response — `404 Not Found`**
```json
"Playlist not found."
```

---

### `GET /api/playlists/mine`
Returns everything tied to the current user: playlists they **created** and playlists they've **saved**. Includes the user's own private playlists (private-status only hides playlists from *other* users' search results).

**Auth required:** yes

**Response — `200 OK`**
```json
{
  "created": [
    {
      "id": "3f29a1c4-8e2d-4b1a-9c3e-7d5f6a8b9c0d",
      "name": "There Will Be Blood (Original Motion Picture Soundtrack)",
      "creatorUsername": "aj",
      "source": "system",
      "songCount": 8,
      "createdAt": "2026-08-23T16:40:11Z"
    }
  ],
  "saved": [
    {
      "id": "9b1e2f3a-1234-4b1a-9c3e-7d5f6a8b9c0d",
      "name": "Paris, Texas",
      "creatorUsername": "someoneelse",
      "source": "system",
      "songCount": 6,
      "createdAt": "2026-08-20T09:12:44Z"
    }
  ]
}
```
---

### `DELETE /api/playlists/{playlistId}`
Deltes a playlist

**Auth required** Yes

**Response - `200 OK`**
```json
{
  "message" : "Playlist deleted successfully."
}
```

---

## Common Error Shapes

All unhandled server errors (MusicBrainz timeouts, YouTube quota errors, database failures, etc.) are caught by global exception-handling middleware and return a clean shape rather than a stack trace:

**`500 Internal Server Error`**
```json
{ "error": "Something went wrong. Please try again later." }
```

**`400 Bad Request`** (model validation failures — malformed request bodies or missing required fields)
```json
{
  "errors": {
    "<FieldName>": ["<validation message>"]
  }
}
```

---

## Quick Reference Table

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/signin` | No | Get JWT |
| GET | `/app/songs?title=` | Yes | Fetch soundtrack (read-only) |
| POST | `/app/songs/save?title=` | Yes | Fetch + persist soundtrack, creates playlist |
| GET | `/api/playlists/search?movieTitle=` | Yes | Public playlists for a movie |
| GET | `/api/playlists/{id}` | Yes | Load one playlist's full contents |
| POST | `/api/playlists/{id}/save` | Yes | Bookmark a playlist |
| DELETE | `/api/playlists/{id}/save` | Yes | Unsave (remove bookmark) |
| PATCH | `/api/playlists/{id}/visibility` | Yes | Toggle public/private (creator-only) |
| GET | `/api/playlists/mine` | Yes | Current user's created + saved playlists |
