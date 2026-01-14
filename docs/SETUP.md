# NΞØ Agent - Guia de Operação (Setup & Testing)

Este guia contém as instruções necessárias para configurar o ambiente de desenvolvimento e validar as funcionalidades do agente.

---

## 🚀 Quick Start

Siga os passos abaixo para colocar o agente em execução:

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves de API (Google, Kwil, etc)

# 3. Iniciar infraestrutura Kwil (Docker)
docker-compose up -d

# 4. Implantar o esquema do banco de dados
npx ts-node scripts/deploy-kwil.ts

# 5. Iniciar o agente em modo desenvolvimento
npm run dev
```

---

## 🧪 Testing & Validação

Utilize os comandos abaixo para garantir que tudo está funcionando corretamente.

### 1. Teste E2E (Escrita no Kwil)
Valida se o agente consegue gravar dados no banco de dados descentralizado:
```bash
npx ts-node scripts/test-e2e-write.ts
```

### 2. Teste via Webhook (Simulação de Dashboard)
Simula uma requisição de qualificação de lead enviada pelo frontend:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "qualify_lead",
    "context": {
      "message": "Qualifique Alice da TechCorp",
      "sender": "user@example.com"
    }
  }'
```

### 3. Auditoria de Código
Verifica a saúde do projeto, tipos e linting:
```bash
npm run audit
```

---
*Última atualização: 14/01/2026*
