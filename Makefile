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

# --no-cache: the container runs as root and writes into the mounted backend folder, so on a
# Linux host a cache would be a root-owned folder the developer can't delete. Dev-only concern.
lint:
	$(BACKEND) ruff check --no-cache .
	$(BACKEND) ruff format --check --no-cache .
	cd frontend && pnpm lint && pnpm typecheck
