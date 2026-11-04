# Gymeri
>A platform for finding gyms and personal trainers in your city. Launching in Lutsk, Ukraine.
 
## About
 
Gymeri helps people choose where and with whom to train. It brings together three groups of users:
 
- **Clients** browse gyms and chains, compare prices, and contact trainers.
- **Trainers** publish a profile and receive requests from clients.
- **Gyms and chains** maintain pages with addresses, prices, and contacts.
Core features: a catalog of gyms with prices and map locations, trainer profiles with search and filters, client requests to trainers, an exercise library with technique guides, and role-based accounts.
 
## Architecture
 
The system is a **modular monolith** on the backend and a server-rendered web app on the frontend, backed by one PostgreSQL database.
 
- **Backend:** a single Django service. Its internal modules are Django apps with clear boundaries, so an app can be extracted into a separate service later if needed.
- **Frontend:** a Next.js (React + TypeScript) application. Catalog pages are rendered on the server, so gym and trainer pages are indexable by search engines.
```
browser ── Vercel (CDN / edge) ┐
                               ▼
┌────────────────────────────────────────────────────────────┐
│ frontend   Next.js (App Router, TypeScript strict)         │
│ server-rendered catalog pages, presentation only           │
└────────────────────────────────────────────────────────────┘
                               │
                               │  REST /api/v1
                               ▼
┌────────────────────────────────────────────────────────────┐
│ backend   Django + Django REST Framework                   │
│ modular monolith of domain apps:                           │
│ accounts · gyms · trainers · requests · exercises          │
│ (+ config)                                                 │
└────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
     PostgreSQL          S3-compatible       Scheduled jobs
       (Neon)               storage        (reminders, later)
     migrations         (photos, files)     Telegram / email
 
Sentry + structured JSON logs: monitoring of the whole stack
```
 
| # | Component | Technology | Role | Talks to |
|---|---|---|---|---|
| 1 | Browser | Any modern browser | User interface | Frontend |
| 2 | Frontend | Next.js, React, TypeScript | Renders pages, calls the API | Backend via REST (`/api/v1`) |
| 3 | Backend | Django (modular monolith) | Business logic, auth, API | Database, file storage |
| 4 | Database | PostgreSQL | Persistent data | Backend only |
| 5 | File storage | S3-compatible | Photos and files | Backend (signed URLs) |
 
Request flow: `Browser → Frontend → Backend → Database / File storage`.
 
The frontend is a presentation layer only. All business logic and data access live in the Django backend.
 
### Backend apps
 
| App | Responsibility |
|---|---|
| `accounts` | Registration, login, roles |
| `gyms` | Gyms, chains, price options |
| `trainers` | Trainer profiles and specializations |
| `requests` | Client requests to trainers |
| `exercises` | Exercise library |
 
Apps communicate through their services, not by reaching into each other's models and tables.
 
### Backend layers
 
```
views / serializers  ->  services  ->  models (ORM)  ->  database
```
 
- **Views and serializers** handle HTTP, validation, and serialization, and delegate to services.
- **Services** contain business logic and access rules.
- **Models** describe the data and simple entity rules.
## Tech stack
 
| Layer | Technology |
|---|---|
| Backend | Python 3.11+, Django, Django REST Framework |
| Database | PostgreSQL, Django migrations |
| Frontend | Next.js (App Router), React, TypeScript |
| Testing and quality | pytest, pytest-django, ruff; ESLint for the frontend |
| CI | GitHub Actions |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |
 
## Repository structure
 
```
.
├── backend/
│   ├── config/           # settings, urls, wsgi/asgi
│   ├── apps/
│   │   ├── accounts/
│   │   ├── gyms/
│   │   ├── trainers/
│   │   ├── requests/
│   │   └── exercises/    # each app: models, services, serializers,
│   │                     # views, urls, migrations/, tests/
│   └── manage.py
├── frontend/             # Next.js + TypeScript
│   ├── app/              # routes (App Router)
│   ├── components/
│   └── lib/              # API client, shared utilities
├── .env.example
└── README.md
```
 
## Getting started
 
Requirements: Python 3.11+, Node.js 20+, PostgreSQL.
 
### Backend
 
```bash
cp .env.example .env              # set DATABASE_URL and secrets
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
 
The Django admin is available at `/admin/` and is used to manage the catalog of gyms and trainers.
 
### Frontend
 
```bash
cd frontend
npm install
npm run dev
```
 
## Database migrations
 
Models are the source of truth. Migrations are generated from them, numbered per app, and committed to the repository.
 
```bash
python manage.py makemigrations   # creates 0001_initial.py, 0002_..., ...
python manage.py migrate          # applies them
```
 
Migration files live in each app's `migrations/` folder. Review generated files before committing, and do not edit migrations that have already been applied.
 
## Contributing
 
1. Create a branch from `main`.
2. Keep changes focused; add or update tests.
3. Make sure lint and tests pass.
4. Open a pull request.
## License
 
TBD
