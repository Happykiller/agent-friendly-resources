IMAGE     := fiscal-fr-mcp
CONTAINER := kalifa
VERSION   := $(shell node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
TAG       := $(IMAGE):$(VERSION)
TAR       := $(IMAGE)-$(VERSION).tar

.PHONY: all build package install stop clean

all: package

## build — construit l'image Docker localement
build:
	docker build -t $(TAG) .

## package — construit l'image et exporte le livrable .tar
package: build
	docker save -o $(TAR) $(TAG)
	@echo ""
	@echo "Livrable prêt : $(TAR)"
	@echo "Copiez sur le serveur : $(TAR)  Makefile  docker-compose.yml  .env.example"
	@echo "Puis : cp .env.example .env && vi .env && make install"

## install — charge l'image et démarre le container (à lancer sur le serveur)
install:
	@test -f "$(TAR)" || { echo "Erreur : $(TAR) introuvable — lancez make package d'abord"; exit 1; }
	@test -f ".env"   || { echo "Erreur : .env manquant — copiez .env.example et configurez-le"; exit 1; }
	docker load -i $(TAR)
	docker network inspect interservices >/dev/null 2>&1 || docker network create interservices
	VERSION=$(VERSION) docker compose up -d
	@echo "Serveur démarré → http://localhost:3333/mcp (container: $(CONTAINER))"

## stop — arrête le container
stop:
	docker compose down

## clean — supprime container, image et tar
clean: stop
	docker rmi $(TAG) 2>/dev/null || true
	rm -f $(TAR)
