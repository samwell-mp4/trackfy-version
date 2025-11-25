# VideoSIA - Frontend Setup

## 🚀 Como Usar

### 1. Configurar Google Sheets API

Antes de rodar o projeto, você precisa configurar a API do Google Sheets:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a **Google Sheets API**
4. Crie credenciais (API Key)
5. Crie uma planilha no Google Sheets com a seguinte estrutura:

**Nome da planilha:** `planilha_user`

| Usuario | Email | Senha |
|---------|-------|-------|
| João Silva | joao@email.com | senha123 |
| Maria Santos | maria@email.com | senha456 |

6. Copie o ID da planilha (está na URL: `https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit`)

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
VITE_GOOGLE_CLIENT_ID=190435189255-pv7jho1babto8gcd7i4ek8jqp3s76khm.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
VITE_GOOGLE_SHEETS_ID=SEU_ID_DA_PLANILHA_AQUI
VITE_SHEET_NAME=planilha_user

# n8n Configuration
VITE_N8N_WEBHOOK_BASE_URL=https://evolution-n8n.o9g2gq.easypanel.host
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Rodar o Projeto

```bash
npm run dev
```

O projeto estará disponível em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx    # Proteção de rotas
│   └── common/
│       ├── Button.tsx             # Componente de botão
│       └── Input.tsx              # Componente de input
├── contexts/
│   └── AuthContext.tsx            # Contexto de autenticação
├── hooks/
│   └── useAuth.ts                 # Hook de autenticação
├── pages/
│   ├── Login.tsx                  # Página de login
│   └── Dashboard.tsx              # Dashboard (em desenvolvimento)
├── services/
│   └── googleSheets.ts            # Serviço Google Sheets API
├── styles/
│   └── global.css                 # Estilos globais
├── types/
│   └── user.ts                    # Tipos TypeScript
└── App.tsx                        # Configuração de rotas
```

## 🎨 Design System

O projeto usa um design system minimalista e tecnológico com:

- **Tema Dark Mode** por padrão
- **Paleta de cores** moderna (Indigo/Purple)
- **Tipografia** Inter + Outfit
- **Animações** com Framer Motion
- **Componentes** reutilizáveis

## 🔐 Autenticação

A autenticação é feita via Google Sheets:

1. Usuário preenche email e senha
2. Sistema consulta a planilha via Google Sheets API
3. Valida credenciais
4. Cria sessão local (localStorage)
5. Auto-logout após 30 minutos de inatividade

## ⚠️ Importante

> **Segurança**: Este método de autenticação é adequado para MVPs e protótipos. Para produção, migre para um sistema com hash de senhas e banco de dados adequado.

## 📦 Tecnologias

- React 18
- TypeScript
- Vite
- React Router DOM
- Framer Motion
- Axios
- Google Sheets API

## 🔧 Próximos Passos

- [ ] Implementar Dashboard completo
- [ ] Criar interface de upload de mídias
- [ ] Integrar com n8n webhooks
- [ ] Implementar geração de vídeos
- [ ] Adicionar templates personalizados
