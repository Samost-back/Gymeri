BACKEND = docker compose run --rm backend

.PHONY: up down migrate makemigrations seed test lint

# -V drops the old node_modules volume, so dependencies always match the rebuilt image.
up:
	docker compose up --build -V

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
	cd frontend && pnpm test

lint:
	$(BACKEND) ruff check .
	$(BACKEND) ruff format --check .
	cd frontend && pnpm lint && pnpm typecheck
