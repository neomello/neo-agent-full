
# NΞØ Agent - Project Management Makefile

.PHONY: help setup infra audit test dev build save sync clean

help:
	@echo "🤖 NΞØ Agent Control Hub"
	@echo "------------------------"
	@echo "make setup    - Instala dependências e prepara ambiente"
	@echo "make infra    - Inicializa infraestrutura (Kwil Docker)"
	@echo "make audit    - Executa auditoria completa de código e tipos"
	@echo "make test     - Executa testes E2E de escrita no Kwil"
	@echo "make dev      - Inicia o servidor do agente em modo desenvolvimento"
	@echo "make build    - Compila o código TypeScript para JavaScript"
	@echo "make save     - Executa o script de safe-push para git"
	@echo "make clean    - Remove artefatos de build e dependências"

setup:
	npm install
	@if [ ! -f .env ]; then cp .env.example .env && echo "⚠️  .env criado. Configure suas chaves!"; fi

infra:
	docker-compose up -d
	@echo "🚀 Infraestrutura Kwil iniciada."

audit:
	npm run audit

test:
	npx ts-node scripts/test-e2e-write.ts

dev:
	npm run dev

build:
	npm run build

save:
	@if [ -f ./scripts/safe-push.sh ]; then bash ./scripts/safe-push.sh; else echo "❌ scripts/safe-push.sh não encontrado."; fi

sync: save

clean:
	rm -rf dist
	rm -rf node_modules
	@echo "✨ Workspace limpo."