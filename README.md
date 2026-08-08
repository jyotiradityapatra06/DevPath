# DevPath

DevPath is a Developer Readiness & Career Intelligence Platform. Phase 1 provides the production-ready application foundation: authentication, persistence, migrations, and deployment-oriented configuration. Readiness scoring and other intelligence features are intentionally out of scope for this phase.

## Phase 1 features

- FastAPI health, signup, and login endpoints with interactive Swagger docs
- Bcrypt password hashing and expiring JWT access tokens
- PostgreSQL persistence through SQLAlchemy, with Alembic migrations
- Duplicate-email and invalid-credential handling with safe transaction rollback
- Next.js 16 frontend foundation
- Pytest coverage for health and authentication flows

## Tech stack

- Frontend: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion
- Backend: Python 3.12, FastAPI, SQLAlchemy, Alembic, JWT
- Data and deployment: PostgreSQL (Neon), Vercel frontend, Render backend

## Local setup

### Backend

Create a PostgreSQL database, then from `backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set these values in `backend/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg://username:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
```

Apply the versioned schema and start the API:

```powershell
alembic upgrade head
uvicorn app.main:app --reload
```

The API is at `http://localhost:8000`, health at `/health`, and Swagger at `/docs`. For a simple non-migration bootstrap, `python -m app.database.init_db` also creates registered tables.

Run tests from `backend` with `pytest`.

### Frontend

From `frontend`:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` to verify a production build.

## Deployment

Configure the frontend root as `frontend` on Vercel. Configure the backend root as `backend` on Render, install `requirements.txt`, run `alembic upgrade head` during release, and start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Store all environment values in the deployment providers; real `.env` files are ignored by Git.
