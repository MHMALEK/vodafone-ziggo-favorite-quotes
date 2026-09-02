.DEFAULT_GOAL := help

IMAGE := favorites-quotes-server
CONTAINER := favorites-quotes
PORT ?= 4000

.PHONY: help setup run dev test coverage e2e e2e-app lint build docker-build docker-run docker-logs docker-stop mobile

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-14s %s\n", $$1, $$2}'

setup: ## Install dependencies (server + mobile when present)
	cd server && npm install
	@if [ -d mobile ]; then cd mobile && npm install; fi

run: ## Run API + Expo app together (Ctrl+C stops both)
	@trap 'kill 0' EXIT INT TERM; (cd server && npm run dev) & (cd mobile && npx expo start) & wait

dev: ## Run the API in watch mode
	cd server && npm run dev

test: ## Run all tests
	cd server && npm test
	@if [ -d mobile ]; then cd mobile && npm test; fi

coverage: ## Run server tests with the coverage gate
	cd server && npm run test:coverage

e2e: ## Run Playwright API tests (boots its own server)
	cd server && npm run test:e2e

e2e-app: ## Run the Maestro app flow (needs `make run` + booted simulator + maestro CLI)
	maestro test mobile/.maestro/app-flow.yaml

lint: ## Lint the server
	cd server && npm run lint

build: ## Type-check and build the server
	cd server && npm run build

docker-build: ## Build the server image
	docker build -t $(IMAGE) server

docker-run: ## Run the server container (reads server/.env)
	docker run -d --rm --name $(CONTAINER) --env-file server/.env -e PORT=$(PORT) -p $(PORT):$(PORT) $(IMAGE)

docker-logs: ## Tail container logs
	docker logs -f $(CONTAINER)

docker-stop: ## Stop the container (graceful SIGTERM)
	docker stop $(CONTAINER)

mobile: ## Start the Expo app
	cd mobile && npx expo start
