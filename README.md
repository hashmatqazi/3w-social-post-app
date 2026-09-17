# 3W Social Post App

A mini social media platform inspired by the TaskPlanet social feed.

## Features

- Signup / Login with JWT authentication
- Create posts with text, image upload (file), or both
- Public feed (newest first) with pagination (10 posts per page)
- Filter feed by All Posts / Most Liked / Most Commented
- Like / Unlike posts (toggle) — stores who liked
- Comment on posts — stores username per comment
- Instant UI updates (no page reload needed)
- Dark theme UI inspired by TaskPlanet

## Tech Stack

- **Frontend**: React.js + Vite, plain CSS (no Tailwind)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas)
- **Image Upload**: Multer (stores files on disk, serves via /uploads)

## Project Structure

```
3w-social-post-app/
├── backend/
│   ├── controllers/        # Business logic
│   ├── middleware/          # Auth (JWT) + Upload (Multer)
│   ├── model/               # Mongoose schemas (User, Post)
│   ├── routes/              # Express route definitions
│   ├── uploads/             # Image files stored here (gitignored)
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, PostCard, CreatePost, CommentSection, Toast
    │   ├── context/         # AuthContext (global auth state)
    │   ├── pages/           # LoginPage, FeedPage
    │   ├── utils/           # api.js (all fetch calls)
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

## Local Setup

### Backend

```bash
cd backend
npm install

# Copy .env.example to .env and fill in your values
cp .env.example .env
# Set MONGO_URI and JWT_SECRET in .env

npm run dev   # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install

# Copy .env.example to .env
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api

npm run dev   # runs on http://localhost:5173
```

## Deployment

### Backend → Render

1. Push `backend/` folder to GitHub
2. Create new **Web Service** on [Render](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`

### Frontend → Vercel / Netlify

1. Push `frontend/` folder to GitHub
2. Import on [Vercel](https://vercel.com) or Netlify
3. Set environment variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`
4. Build command: `npm run build` | Output dir: `dist`

### Database → MongoDB Atlas

1. Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create database user + whitelist `0.0.0.0/0` for access from Render
3. Copy connection string → paste as `MONGO_URI` in Render env vars

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login, returns JWT |
| GET | /api/posts?page=1&limit=10 | ❌ | Get paginated feed |
| POST | /api/posts | ✅ | Create post (multipart) |
| POST | /api/posts/:id/like | ✅ | Toggle like |
| POST | /api/posts/:id/comments | ✅ | Add comment |
