BACKEND = docker compose run --rm backend

.PHONY: up down migrate makemigrations test lint

up:
	docker compose up --build

down:
	docker compose down

migrate:
	$(BACKEND) python manage.py migrate

makemigrations:
	$(BACKEND) python manage.py makemigrations

test:
	$(BACKEND) pytest

lint:
	$(BACKEND) ruff check .
	$(BACKEND) ruff format --check .
	cd frontend && pnpm lint && pnpm typecheck
