# ========================================
# Multi-service Dockerfile
# Frontend (React + Vite) + Backend (Node.js + Express)
# ========================================
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache bash curl

# Diretório de trabalho
WORKDIR /app

# ========================================
# BACKEND - Node.js puro (sem build necessário)
# ========================================
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copiar código-fonte do backend
COPY backend ./

# ========================================
# FRONTEND - React + Vite (requer build)
# ========================================
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

# Copiar código-fonte do frontend
COPY frontend ./

# Build de produção do frontend
RUN npm run build

# ========================================
# Script de inicialização para ambos os serviços
# ========================================
WORKDIR /app
RUN echo '#!/bin/bash' > start.sh && \
    echo 'set -e' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "🚀 Iniciando Backend na porta 3000..."' >> start.sh && \
    echo 'cd /app/backend && npm start &' >> start.sh && \
    echo 'BACKEND_PID=$!' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "🚀 Iniciando Frontend na porta 3100..."' >> start.sh && \
    echo 'cd /app/frontend && npm run preview -- --host 0.0.0.0 --port 3100 &' >> start.sh && \
    echo 'FRONTEND_PID=$!' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "✅ Ambos os serviços iniciados!"' >> start.sh && \
    echo 'echo "   Backend: http://localhost:3000"' >> start.sh && \
    echo 'echo "   Frontend: http://localhost:3100"' >> start.sh && \
    echo '' >> start.sh && \
    echo 'wait $BACKEND_PID $FRONTEND_PID' >> start.sh && \
    chmod +x start.sh

# Expor portas
EXPOSE 3000 3100

# Health check para garantir que os serviços estão rodando
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || curl -f http://localhost:3100/ || exit 1

# Comando de inicialização
CMD ["./start.sh"]
