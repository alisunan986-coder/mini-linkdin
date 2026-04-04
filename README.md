# Mini LinkedIn for Students

A full-stack, internship-ready mini LinkedIn clone: **React** (frontend), **Node.js + Express** (backend), **MySQL** (database). Includes JWT auth, CRUD for users/posts/comments/skills, like/unlike, and optional polling for feed updates.

---

## Features

- **Auth**: Register & Login with JWT; passwords hashed with bcrypt
- **Profile**: Update name, bio, email, profile picture (URL); add/remove skills
- **Feed**: Create, edit, delete posts; like/unlike; comment; optional 30s polling
- **Database**: Users, Skills, Posts, Comments, Likes with foreign keys
- **Code**: Modular (controllers, routes, components), validated input, CORS, error handling

---

## Project Structure

```
Linkdin/
├── backend/                 # Node + Express API
│   ├── config/db.js         # MySQL pool
│   ├── middleware/auth.js   # JWT auth
│   ├── controllers/        # auth, user, post, comment, skill, like
│   ├── routes/             # API route definitions + validation
│   ├── app.js
│   └── server.js
├── database/
│   └── schema.sql          # MySQL schema (run once)
├── src/                    # React (Vite)
│   ├── api/api.js         # API client
│   ├── context/AuthContext.jsx
│   ├── components/        # Layout, PostCard, CommentBox, SkillList, ProfileHeader
│   ├── pages/             # Login, Register, Dashboard, Profile, EditProfile
│   └── App.jsx
├── package.json            # Frontend
└── README.md
```

---

## Local Setup

### 1. Database (MySQL)

- Install MySQL (e.g. [MySQL Community](https://dev.mysql.com/downloads/mysql/) or XAMPP).
- Create DB and tables:

```bash
mysql -u root -p < database/schema.sql
```

Or open `database/schema.sql` in MySQL Workbench and run it.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, CLIENT_URL (e.g. http://localhost:5173)
npm install
npm run dev
```

Server runs at **http://localhost:5000**.

### 3. Frontend

From project root:

```bash
npm install
npm run dev
```

App runs at **http://localhost:5173**. Vite proxy sends `/api` to the backend.

### 4. Connect Frontend to Backend

- **Local**: No extra config; Vite proxies `/api` to `http://localhost:5000`.
- **Production**: Set `VITE_API_URL` to your backend base URL (e.g. `https://your-api.onrender.com`) before building. The frontend will call `VITE_API_URL + '/api/...'`.

---

## Environment Variables

### Backend (`.env`)

| Variable     | Description                    | Example                |
|-------------|--------------------------------|------------------------|
| PORT        | Server port                    | 5000                   |
| JWT_SECRET  | Secret for signing JWTs        | long-random-string     |
| DB_HOST     | MySQL host                     | localhost / cloud host |
| DB_USER     | MySQL user                     | root                   |
| DB_PASSWORD | MySQL password                 | (your password)        |
| DB_NAME     | Database name                  | minilinkedin           |
| CLIENT_URL  | Frontend origin (CORS)         | http://localhost:5173 |

### Frontend (build-time)

| Variable       | Description              | Example                          |
|----------------|--------------------------|----------------------------------|
| VITE_API_URL   | Backend base URL (prod)  | https://your-api.onrender.com    |

---

## Deployment

### Backend (Render or Railway)

1. Create a new **Web Service** (Render) or **Service** (Railway).
2. Connect the repo; set root to `backend` (or build command to run from `backend`).
3. Set env vars: `PORT`, `JWT_SECRET`, `DB_*`, `CLIENT_URL` = your frontend URL.
4. Start command: `npm start` (runs `node server.js`).

### Database (Cloud MySQL)

- **PlanetScale**: Create a branch, get connection string; use host/user/password in `DB_*`.
- **Railway**: Add MySQL plugin; use provided `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

Run `database/schema.sql` against the cloud DB (PlanetScale/Railway CLI or GUI).

### Frontend (Vercel or Netlify)

1. Connect the repo; build command: `npm run build`; output: `dist`.
2. Set **VITE_API_URL** to your deployed backend URL (e.g. `https://your-api.onrender.com`).
3. Deploy. Then set backend **CLIENT_URL** to the frontend URL (e.g. `https://your-app.vercel.app`).

### Connecting deployed frontend and backend

- Backend **CLIENT_URL** = frontend origin (e.g. `https://minilinkedin.vercel.app`) so CORS allows it.
- Frontend **VITE_API_URL** = backend URL (e.g. `https://minilinkedin-api.onrender.com`). Rebuild after changing.

---

## API Overview

| Method | Endpoint                    | Auth | Description        |
|--------|-----------------------------|------|--------------------|
| POST   | /api/auth/register          | No   | Register           |
| POST   | /api/auth/login             | No   | Login              |
| GET    | /api/users/me               | Yes  | Current user       |
| GET    | /api/users/:id              | No   | User by ID         |
| PUT    | /api/users/me               | Yes  | Update profile     |
| GET    | /api/posts                  | No   | All posts (feed)   |
| GET    | /api/posts/:id              | No   | One post           |
| POST   | /api/posts                  | Yes  | Create post        |
| PUT    | /api/posts/:id              | Yes  | Update post (owner)|
| DELETE | /api/posts/:id              | Yes  | Delete post (owner)|
| GET    | /api/posts/:id/comments     | No   | Comments           |
| POST   | /api/posts/:id/comments     | Yes  | Add comment        |
| POST   | /api/posts/:id/like         | Yes  | Toggle like        |
| GET    | /api/posts/:id/like         | Yes  | Like status        |
| GET    | /api/skills/user/:userId    | No   | User skills        |
| POST   | /api/skills                 | Yes  | Add skill          |
| DELETE | /api/skills/:id             | Yes  | Delete skill (owner)|
| DELETE | /api/comments/:id           | Yes  | Delete comment (owner)|

---

## Optional / Bonus

- **Responsive**: Layout and components use responsive CSS (breakpoints ~600px, 480px).
- **“Real-time”**: Dashboard polls feed every 30s; adjust `POLL_INTERVAL_MS` in `Dashboard.jsx` or add WebSocket later.
- **Profile picture**: Stored as URL in `profile_picture`. For file uploads, add cloud storage (e.g. Cloudinary/S3) and a backend upload route that returns the image URL.

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router 7, CSS Modules
- **Backend**: Node.js, Express, mysql2, bcryptjs, jsonwebtoken, express-validator, cors, dotenv
- **Database**: MySQL 8 (or compatible)

---

## License

MIT.
