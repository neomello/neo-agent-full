
.PHONY: audit audit-state audit-tools audit-dashboard audit-core help

help:
	@echo "🔍 NΞØ Agent Auditor"
	@echo "-------------------"
	@echo "make audit           - Roda auditoria completa"
	@echo "make audit-state     - Audita drivers de banco de dados e storage"
	@echo "make audit-tools     - Audita integrações e adaptadores"
	@echo "make audit-core      - Audita o cérebro (LangChain) e roteador"
	@echo "make audit-dashboard - Audita a aplicação Next.js"

audit:
	npx ts-node scripts/code-analysis.ts --scope=all

audit-state:
	npx ts-node scripts/code-analysis.ts --scope=state

audit-tools:
	npx ts-node scripts/code-analysis.ts --scope=tools

audit-core:
	npx ts-node scripts/code-analysis.ts --scope=core

audit-dashboard:
	npx ts-node scripts/code-analysis.ts --scope=dashboard

save:
	@./scripts/safe-push.sh

sync: save