BACKEND = docker compose run --rm backend

.PHONY: up down logs ps migrate makemigrations seed test lint

# -d runs containers in the background and frees the terminal; logs are in `make logs`.
# -V drops the old node_modules volume, so dependencies always match the rebuilt image.
# --quiet-build/--quiet-pull hide image build and download progress; build errors still show.
up:
	docker compose up --build -d -V --quiet-build --quiet-pull

down:
	docker compose down

# Follows all services; Ctrl+C stops only the log view, the containers keep running.
logs:
	docker compose logs -f --tail=100

ps:
	docker compose ps

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
