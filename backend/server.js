require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
        if (err) {
            console.error('Erro de autenticação:', err.message);
            return res.sendStatus(403);
        }
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

// Importar serviço do Google Drive
const driveService = require('./services/driveService');

// Rota da Galeria (Google Drive + Supabase Tracking)
app.get('/api/gallery', authenticateToken, async (req, res) => {
    try {
        // 1. Buscar vídeos do Drive
        const driveVideos = await driveService.listUserVideos(req.user.id);

        // 2. Buscar status de postagem no Supabase
        const { data: trackingData, error } = await supabase
            .from('gallery_tracking')
            .select('drive_file_id, is_posted')
            .eq('user_id', req.user.id);

        if (error) {
            console.error('Erro ao buscar tracking:', error);
            // Não falha a requisição, apenas loga o erro e segue sem status
        }

        // 3. Mesclar dados
        const videos = driveVideos.map(video => {
            const tracking = trackingData?.find(t => t.drive_file_id === video.id);
            return {
                ...video,
                isPosted: tracking ? tracking.is_posted : false
            };
        });

        res.json({ videos });
    } catch (error) {
        console.error('Erro na rota da galeria:', error);
        res.status(500).json({
            error: 'Erro ao carregar galeria',
            details: error.message
        });
    }
});

// Rota para alternar status de postagem
app.post('/api/gallery/toggle-posted', authenticateToken, async (req, res) => {
    const { drive_file_id, is_posted } = req.body;

    if (!drive_file_id) {
        return res.status(400).json({ error: 'ID do arquivo é obrigatório' });
    }

    try {
        const { data, error } = await supabase
            .from('gallery_tracking')
            .upsert({
                user_id: req.user.id,
                drive_file_id,
                is_posted
            }, { onConflict: 'user_id, drive_file_id' })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

// Rota de teste protegida
app.get('/me', authenticateToken, (req, res) => {
    res.json({ message: 'Acesso autorizado', user: req.user });
});

// Proxy para n8n webhook (evita CORS)
app.post('/api/trigger-n8n', authenticateToken, async (req, res) => {
    const { request_id, user, metodo, frase, images } = req.body;

    if (!images || images.length === 0) {
        return res.status(400).json({ error: 'Imagens são obrigatórias' });
    }

    try {
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
            console.error('N8N_WEBHOOK_URL não configurado');
            return res.status(500).json({ error: 'Webhook não configurado' });
        }

        const payload = {
            request_id,
            user,
            metodo,
            images
        };

        if (metodo === 'Manual' && frase) {
            payload.frase = frase;
        }

        // Fazer requisição para n8n
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro do n8n:', errorText);
            return res.status(response.status).json({
                error: 'Falha ao acionar workflow',
                details: errorText
            });
        }

        const result = await response.json();
        res.json({ success: true, result });

    } catch (error) {
        console.error('Erro ao chamar n8n:', error);
        res.status(500).json({ error: 'Erro ao acionar workflow' });
    }
});

// Servir arquivos de destaques (gerados pelo backend)
app.use('/highlights', express.static(path.join(__dirname, 'public/highlights')));

// Serviço de YouTube
const youtubeService = require('./services/youtubeService');

// Rota para gerar destaques do YouTube
app.post('/api/youtube-highlights', authenticateToken, async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL do YouTube é obrigatória' });
    }

    try {
        // 1. Baixar vídeo
        console.log(`Recebida requisição de destaques para: ${url}`);
        const videoPath = await youtubeService.downloadVideo(url);

        // 2. Extrair destaques
        console.log(`Vídeo baixado em: ${videoPath}. Iniciando extração...`);
        const highlights = await youtubeService.extractHighlights(videoPath);

        // 3. Retornar caminhos (URLs relativas)
        console.log('Destaques gerados:', highlights);
        res.json({ success: true, highlights });

        // Opcional: Limpar vídeo original após processamento para economizar espaço
        // fs.unlinkSync(videoPath); 

    } catch (error) {
        console.error('Erro ao processar destaques:', error);
        res.status(500).json({
            error: 'Erro ao processar vídeo',
            details: error.message
        });
    }
});

// Health check para monitoramento
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir arquivos estáticos do frontend (build do Vite)
const frontendPath = path.join(__dirname, '../frontend/dist');

// Verificar se o build do frontend existe
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    // Rota catch-all para SPA
    app.get('*', (req, res) => {
        const indexPath = path.join(frontendPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Frontend build not found (index.html missing)');
        }
    });
    console.log(`Frontend estático configurado em: ${frontendPath}`);
} else {
    console.log('⚠️ Frontend build não encontrado. Rodando em modo API-only.');
    console.log('   Para servir o frontend, rode "npm run build" na pasta frontend.');
}

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
