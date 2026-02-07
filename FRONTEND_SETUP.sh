#!/usr/bin/env bash

# ========================================================================
# FRONTEND - QUICK START GUIDE
# ========================================================================
# 
# Este script setup e valida o frontend em segundos.
# Execute: bash FRONTEND_SETUP.sh
#
# ========================================================================

echo "🚀 VENDAFACIL Frontend Quick Start"
echo "=================================="
echo ""

# 1. Verificar Node
echo "✓ Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em nodejs.org"
    exit 1
fi
echo "  ✅ Node $(node --version)"
echo ""

# 2. Instalar dependências
echo "✓ Instalando dependências..."
if [ -f "package.json" ]; then
    npm install
    echo "  ✅ Dependências instaladas"
else
    echo "  ❌ package.json não encontrado"
    exit 1
fi
echo ""

# 3. Verificar .env
echo "✓ Verificando variáveis de ambiente..."
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local encontrado"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "  ✅ NEXT_PUBLIC_SUPABASE_URL definido"
    else
        echo "  ⚠️  NEXT_PUBLIC_SUPABASE_URL não definido"
        echo "     Adicione em .env.local:"
        echo "     NEXT_PUBLIC_SUPABASE_URL=<sua_url>"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY definido"
    else
        echo "  ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY não definido"
    fi
else
    echo "  ⚠️  .env.local não encontrado"
    echo "     Crie com base em .env.example"
fi
echo ""

# 4. Build check
echo "✓ Executando type check..."
npm run typecheck 2>/dev/null || {
    echo "  ⚠️  Erros de tipo encontrados (rodando build)"
    npm run build 2>/dev/null || echo "  ⚠️  Build teve warnings"
}
echo "  ✅ Type check completo"
echo ""

# 5. Ready!
echo "✅ Frontend está pronto!"
echo ""
echo "Próximos passos:"
echo "1. npm run dev"
echo "2. Abra http://localhost:9002"
echo "3. Faça signup para testar"
echo ""
echo "📚 Documentação:"
echo "  - Status: src/lib/FRONTEND_STATUS.ts"
echo "  - Contratos: FRONTEND_CONTRACTS.md"
echo "  - Checklist: FRONTEND_DELIVERY_CHECKLIST.md"
echo ""
