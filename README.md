# Gymeri

> Платформа для пошуку спортзалів і персональних тренерів у твоєму місті. Старт у Луцьку.

## Про проєкт

Gymeri допомагає обрати, де й з ким тренуватися. Платформа об'єднує три групи користувачів:

- **Клієнти** переглядають зали й мережі, порівнюють ціни та звертаються до тренерів.
- **Тренери** публікують профіль і отримують заявки від клієнтів.
- **Зали й мережі** ведуть сторінки з адресами, цінами й контактами.

Основні можливості: каталог залів із цінами та розташуванням на мапі, профілі тренерів із пошуком і фільтрами, заявки клієнтів тренерам, довідник вправ із технікою виконання, акаунти з ролями.

## Архітектура

Система складається з **модульного моноліту** на backend і web-застосунку з серверним рендерингом на frontend. Дані зберігаються в одній базі PostgreSQL.

- **Backend:** один Django-сервіс. Його внутрішні модулі це Django apps із чіткими межами, тож за потреби будь-який app можна згодом винести в окремий сервіс.
- **Frontend:** застосунок на Next.js (React + TypeScript). Публічні сторінки каталогу рендеряться на сервері, тому сторінки залів і тренерів індексуються пошуковими системами.

```
┌─────────┐   ┌──────────────┐       ┌──────────────┐
│         │   │   Frontend   │       │   Backend    │      ┌────────────┐
│ Browser │──►│   Next.js    │─REST─►│ Django + DRF │─────►│   Files    │
│         │   │    Vercel    │       │ ECS Fargate  │      │ Amazon S3  │
└─────────┘   └──────────────┘       └──────────────┘      └────────────┘
                                             ▲
                                             │
                                             ▼
                                      ┌────────────┐
                                      │ PostgreSQL │
                                      │ Amazon RDS │
                                      └────────────┘

CI/CD:  GitHub ──► GitHub Actions (lint, tests) ──► deploy to Vercel and AWS
```

| # | Компонент | Технологія | Роль | З чим взаємодіє |
|---|---|---|---|---|
| 1 | Browser | Будь-який сучасний браузер | Інтерфейс користувача | Frontend |
| 2 | Frontend | Next.js, React, TypeScript | Рендерить сторінки, викликає API | Backend через REST (`/api/v1`) |
| 3 | Backend | Django (модульний моноліт) | Бізнес-логіка, автентифікація, API | База даних, сховище файлів |
| 4 | Database | PostgreSQL (Amazon RDS) | Постійні дані | Лише backend |
| 5 | File storage | Amazon S3 | Фото й файли | Backend (signed URLs) |

Потік запиту: `Browser → Frontend → Backend → Database / File storage`.

### Принципи

- **Бізнес-логіка живе в Django.** Frontend це шар відображення, він не дублює правила й не звертається до даних напряму.
- **Одне джерело (origin) для користувача.** Браузер працює з одним доменом (див. [Хостинг і мережа](#хостинг-і-мережа)).
- **Конфігурація через змінні середовища.** Жодних секретів у коді чи в Git.
- **Схема бази змінюється лише через міграції.**
- **Stateless backend.** Файли йдуть у S3, а не на локальний диск.

### Backend apps

| App | Відповідальність |
|---|---|
| `accounts` | Реєстрація, вхід, ролі |
| `gyms` | Зали, мережі, варіанти цін |
| `trainers` | Профілі тренерів і спеціалізації |
| `requests` | Заявки клієнтів тренерам |
| `exercises` | Довідник вправ |

Apps спілкуються через свої services, а не звертаються напряму до моделей і таблиць один одного.

### Шари backend

```
views / serializers  ->  services  ->  models (ORM)  ->  database
```

- **Views і serializers** обробляють HTTP, валідацію й серіалізацію та делегують роботу services.
- **Services** містять бізнес-логіку й правила доступу.
- **Models** описують дані й прості правила сутностей.

## Стек технологій

| Шар | Технологія |
|---|---|
| Backend | Python 3.11+, Django, Django REST Framework |
| Database | PostgreSQL, міграції Django |
| Frontend | Next.js (App Router), React, TypeScript |
| Files | Amazon S3 (приватний bucket, signed URLs) |
| Тести й якість коду | pytest, pytest-django, ruff; ESLint для frontend |
| CI/CD | GitHub, GitHub Actions |
| Хостинг | Vercel (frontend); AWS: ECS Fargate (backend), RDS (база), S3 (файли) |

## Хостинг і мережа

Frontend працює на Vercel; backend, база й сховище файлів на AWS. Сторони спілкуються через HTTPS.

- **Рання стадія:** Next.js проксує `/api/*` на backend, тож браузер бачить одне джерело (origin), і проблем із CORS чи сторонніми cookie не виникає.
- **Production:** власний домен, `site.com` для frontend і `api.site.com` для backend. Session cookies прив'язані до батьківського домену, а backend дозволяє запити лише з домену frontend (CORS і CSRF trusted origins).
- **Секрети** зберігаються в змінних середовища кожної платформи. До браузера потрапляють лише змінні з префіксом `NEXT_PUBLIC_`.

## Структура репозиторію

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

## Як запустити

Потрібно: Python 3.11+, Node.js 20+, pnpm, PostgreSQL.

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

Django admin доступна за адресою `/admin/`, через неї ведеться каталог залів і тренерів.

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## Міграції бази даних

Моделі є джерелом істини. Міграції генеруються з них, нумеруються окремо для кожного app і комітяться в репозиторій.

```bash
python manage.py makemigrations   # creates 0001_initial.py, 0002_..., ...
python manage.py migrate          # applies them
```

Файли міграцій лежать у папці `migrations/` кожного app. Переглядай згенеровані файли перед комітом і не редагуй уже застосовані міграції.

## Як долучитися

1. Створи гілку від `main`.
2. Тримай зміни сфокусованими; додавай або оновлюй тести.
3. Переконайся, що lint і тести проходять.
4. Відкрий pull request.

## Ліцензія

TBD
