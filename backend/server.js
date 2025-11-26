require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        // 1. Verificar usuário no Supabase (tabela 'users')
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password) // Nota: Em produção, use hash de senha!
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // 2. Gerar Token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                usuario: user.usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 3. Retornar dados
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                usuario: user.usuario
            }
        });

    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Middleware de Autenticação (Exemplo para rotas protegidas futuras)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Criar nova requisição de vídeo
app.post('/api/video-request', authenticateToken, async (req, res) => {
    const { metodo, frase, num_images } = req.body;

    if (!metodo || !num_images) {
        return res.status(400).json({ error: 'Método e número de imagens são obrigatórios' });
    }

    try {
        const { data, error } = await supabase
            .from('video_requests')
            .insert([
                {
                    user_id: req.user.id,
                    metodo,
                    frase: frase || null,
                    num_images,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar requisição:', error);
            return res.status(500).json({ error: 'Erro ao salvar requisição' });
        }

        res.json({ success: true, request: data });
    } catch (err) {
        console.error('Erro ao criar requisição:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar requisições de vídeo do usuário
app.get('/api/video-requests', authenticateToken, async (req, res) => {
    const { status } = req.query;

    try {
        let query = supabase
            .from('video_requests')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar requisições:', error);
            return res.status(500).json({ error: 'Erro ao buscar requisições' });
        }

        res.json({ requests: data });
    } catch (err) {
        console.error('Erro ao listar requisições:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota de teste protegida
app.get('/me', authenticateToken, (req, res) => {
    res.json({ message: 'Acesso autorizado', user: req.user });
});

// Health check para monitoramento
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir arquivos estáticos do frontend (build do Vite)
const path = require('path');
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Rota catch-all para SPA - serve o index.html para todas as rotas não-API
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Frontend servido de: ${frontendPath}`);
});
