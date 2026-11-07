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
- **Stateless backend.** Файли зберігаються через Django `STORAGES`: локально на диск, у prod в S3. Backend у prod не покладається на локальний диск.

### Backend apps

| App | Відповідальність |
|---|---|
| `accounts` | Реєстрація, вхід, ролі |
| `gyms` | Зали, мережі, варіанти цін |
| `trainers` | Профілі тренерів і спеціалізації |
| `leads` | Заявки клієнтів тренерам |
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
│   │   ├── leads/
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

Локальна розробка йде через Docker, точка входу це `Makefile`. Увесь проєкт (PostgreSQL, backend, frontend) працює в контейнерах, тож Python, Node.js і PostgreSQL ставити не потрібно.

Потрібно: Docker Desktop, `make`.

### Перший запуск

```bash
cp .env.example .env    # fill in secrets
make up                 # start PostgreSQL, backend and frontend
make migrate
docker compose exec backend python manage.py createsuperuser
```

Після запуску:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/v1/`
- Django admin: `http://localhost:8000/admin/`, через неї ведеться каталог залів і тренерів.

### Щоденна робота

```bash
make up      # start the whole project
make down    # stop the whole project
```

### Тести й lint

Тести й lint не залежать від того, чи запущений проєкт через `make up`.

```bash
make test
make lint
```

## Міграції бази даних

Моделі є джерелом істини. Міграції генеруються з них, нумеруються окремо для кожного app і комітяться в репозиторій.

```bash
make makemigrations     # creates 0001_initial.py, 0002_..., ...
make migrate            # applies them
```

Файли міграцій лежать у папці `migrations/` кожного app. Переглядай згенеровані файли перед комітом і не редагуй уже застосовані міграції.

## Як долучитися

Правила коду, комітів, гілок і pull requests описані в [CLAUDE.md](CLAUDE.md).

1. Створи гілку від `main`.
2. Тримай зміни сфокусованими; додавай або оновлюй тести.
3. Переконайся, що lint і тести проходять.
4. Відкрий pull request.

## Ліцензія

© 2026 Gymeri. All rights reserved.
