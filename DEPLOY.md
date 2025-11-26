# Deploy no EasyPanel - SaaS Video

## 📋 Pré-requisitos

Certifique-se de que as variáveis de ambiente estão configuradas corretamente:

### Backend (.env)
```env
PORT=3000
JWT_SECRET=seu_jwt_secret_aqui
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_supabase
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

## 🐳 Estrutura do Container

O Dockerfile criado:
- ✅ Usa Node.js 20 Alpine (leve e eficiente)
- ✅ Instala dependências de produção
- ✅ Faz build do frontend
- ✅ Executa ambos os serviços simultaneamente
- ✅ Expõe portas 3000 (backend) e 3100 (frontend)

## 🚀 Deploy no EasyPanel

### 1. No EasyPanel

1. Acesse seu container "evolution"
2. Vá para o aplicativo "saas-video"
3. Configure as seguintes portas:
   - **Backend**: 3000
   - **Frontend**: 3100

### 2. Configurar Variáveis de Ambiente

No EasyPanel, adicione as variáveis de ambiente:

**Para o Backend:**
```
PORT=3000
JWT_SECRET=seu_jwt_secret_seguro
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon
```

**Para o Frontend:**
```
VITE_API_URL=https://seu-dominio-backend.com
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

### 3. Build e Deploy

O EasyPanel irá:
1. Detectar o Dockerfile na raiz
2. Fazer build da imagem
3. Iniciar ambos os serviços automaticamente

### 4. Verificar Logs

Após o deploy, verifique os logs para confirmar que ambos os serviços estão rodando:
```
Servidor rodando na porta 3000
  ➜  Local:   http://localhost:3100/
  ➜  Network: http://0.0.0.0:3100/
```

## 🔧 Comandos Úteis para Testes Locais

### Build da imagem Docker:
```bash
docker build -t saas-video .
```

### Executar container:
```bash
docker run -p 3000:3000 -p 3100:3100 --env-file ./backend/.env --env-file ./frontend/.env saas-video
```

### Parar container:
```bash
docker stop $(docker ps -q --filter ancestor=saas-video)
```

## 📝 Notas Importantes

1. **Portas Customizadas**: A porta do frontend foi alterada de 3000 para 3100 para evitar conflitos com n8n e outros apps
2. **Segurança**: Em produção, certifique-se de usar senhas hasheadas (bcrypt) ao invés de senhas em texto plano
3. **CORS**: O backend já está configurado com CORS habilitado para permitir comunicação com o frontend
4. **SSL/HTTPS**: Configure SSL/TLS no EasyPanel para comunicação segura

## 🔐 Checklist de Segurança

- [ ] Alterar JWT_SECRET para um valor seguro e aleatório
- [ ] Configurar HTTPS/SSL no EasyPanel
- [ ] Implementar hash de senhas (bcrypt) no backend
- [ ] Configurar CORS apenas para domínios específicos
- [ ] Adicionar rate limiting nas rotas de autenticação
- [ ] Configurar backup do Supabase
