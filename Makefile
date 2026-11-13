BACKEND = docker compose run --rm backend

.PHONY: up down migrate makemigrations seed test lint

up:
	docker compose up --build

down:
	docker compose down

migrate:
	$(BACKEND) python manage.py migrate

seed:
	$(BACKEND) python manage.py seed_demo

makemigrations:
	$(BACKEND) python manage.py makemigrations

test:
	$(BACKEND) pytest

lint:
	$(BACKEND) ruff check .
	$(BACKEND) ruff format --check .
	cd frontend && pnpm lint && pnpm typecheck
