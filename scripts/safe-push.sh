#!/bin/bash
set -e # Para se houver erro

echo "🛡️  INICIANDO PROTOCOLO DE COMMIT SEGURO NΞØ..."

# 1. Verificar Segurança
echo "🔍 1. Verificando vulnerabilidades..."
npm audit --audit-level=critical
echo "✅ Auditoria OK."

# 2. Lint (Assumindo que existe script lint, senão pule ou ajuste)
# echo "🧹 Verificando Lint..."
# npm run lint

# 3. Build Condicional
echo "🏗️  2. Verificando necessidade de Build..."
# Verifica se houve mudança em arquivos críticos (src, public, configs)
if git diff --name-only | grep -E 'src/|public/|vite.config.js|next.config.js|package.json|.env|tailwind.config.js'; then
    echo "⚠️  Mudanças estruturais detectadas. Executando Build..."
    npm run build
    echo "✅ Build com sucesso."
else
    echo "⏩ Nenhuma mudança crítica. Pulando Build."
fi

# 4. Status e Commit
echo "📝 3. Preparando Commit..."
git status

# Verifica se há algo para commitar
if [ -z "$(git status --porcelain)" ]; then 
  echo "🛑 Nada para commitar."
  exit 0
fi

echo "------------------------------------------------"
echo "Tipos: feat, fix, docs, style, refactor, test, chore"
echo "------------------------------------------------"
read -p "Digita a mensagem de commit (ex: feat: add kwil driver): " msg

if [ -z "$msg" ]; then
    echo "❌ Mensagem obrigatória. Abortando."
    exit 1
fi

# 5. Execução
git add .
git commit -m "$msg"
git push origin main

echo "🚀 PUSH REALIZADO COM SUCESSO. NΞØ PROTOCOL SYNCED."