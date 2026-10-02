// backend/index.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const Gasto = require('./models/Gasto'); 
const Acesso = require('./models/Acesso');
const Feedback = require('./models/Feedback');
const Usuario = require('./models/Usuario');
const { gerarHash, conferirSenha, gerarToken, lerToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Configura CORS
app.use(cors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
}));
app.use(express.json());

// Conexão com o MongoDB
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB conectado com sucesso!'))
    .catch(err => {
        console.error('❌ Erro de conexão com MongoDB:', err.message);
        process.exit(1);
    });

async function exigirLogin(req, res, next) {
    const token = (req.get('authorization') || '').replace(/^Bearer /, '');
    const login = lerToken(token);
    const usuario = login && await Usuario.findOne({ login });
    if (!usuario) {
        return res.status(401).json({ message: 'Faça login para continuar.' });
    }
    req.usuario = usuario;
    next();
}

async function talvezLogin(req, res, next) {
    if (!req.get('authorization')) return next();
    return exigirLogin(req, res, next);
}

function registrarAcesso(req, usuario) {
    return Acesso.create({ nome: usuario.nome, dispositivo: req.get('user-agent') });
}

function validarCredenciais(nome, senha) {
    if (typeof nome !== 'string' || !nome.trim()) return 'Informe o nome.';
    if (nome.trim().length > 80) return 'O nome não pode ter mais de 80 caracteres.';
    if (typeof senha !== 'string' || senha.length < 4) return 'A senha deve ter pelo menos 4 caracteres.';
    return null;
}

function ehAdmin(req) {
    const senha = process.env.ADMIN_PASSWORD;
    const enviada = req.get('x-admin-senha');
    if (!senha || !enviada) return false;
    const a = Buffer.from(senha);
    const b = Buffer.from(enviada);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function listarRegistros(req, res, Model, campoData) {
    const admin = ehAdmin(req);
    if (!admin && !req.usuario) {
        res.status(401).json({ message: 'Faça login para continuar.' });
        return null;
    }
    const filtro = admin ? {} : { nome: req.usuario.nome };
    return Model.find(filtro)
        .collation({ locale: 'pt', strength: 2 })
        .select('-dispositivo')
        .sort({ [campoData]: -1 });
}


app.post('/api/cadastro', async (req, res) => {
    const { nome, senha } = req.body;
    const erro = validarCredenciais(nome, senha);
    if (erro) return res.status(400).json({ message: erro });
    try {
        const login = nome.trim().toLowerCase();
        if (await Usuario.exists({ login })) {
            return res.status(409).json({ message: 'Já existe um usuário com esse nome.' });
        }
        const usuario = await Usuario.create({ login, nome: nome.trim(), senhaHash: gerarHash(senha) });
        await registrarAcesso(req, usuario);
        res.status(201).json({ token: gerarToken(login), nome: usuario.nome });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao criar usuário', error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { nome, senha } = req.body;
    if (typeof nome !== 'string' || typeof senha !== 'string') {
        return res.status(400).json({ message: 'Informe nome e senha.' });
    }
    try {
        const usuario = await Usuario.findOne({ login: nome.trim().toLowerCase() });
        if (!usuario || !conferirSenha(senha, usuario.senhaHash)) {
            return res.status(401).json({ message: 'Nome ou senha incorretos.' });
        }
        await registrarAcesso(req, usuario);
        res.json({ token: gerarToken(usuario.login), nome: usuario.nome });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao entrar', error: err.message });
    }
});

app.get('/api/eu', exigirLogin, (req, res) => {
    res.json({ nome: req.usuario.nome });
});

// ROTAS DA API DE GASTOS (sempre do usuário logado)

// GET (Buscar os gastos do usuário)
app.get('/api/gastos', exigirLogin, async (req, res) => {
    try {
        const gastos = await Gasto.find({ usuario: req.usuario.login }).sort({ data: -1 });
        res.json(gastos);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar gastos', error: err.message });
    }
});

// POST (Criar novo)
app.post('/api/gastos', exigirLogin, async (req, res) => {
    try {
        const { descricao, valor, categoria } = req.body;
        const novoGasto = new Gasto({ descricao, valor, categoria, usuario: req.usuario.login });
        const gastoSalvo = await novoGasto.save();
        res.status(201).json(gastoSalvo);
    } catch (err) {
        res.status(400).json({ message: 'Erro ao criar gasto', error: err.message });
    }
});

// DELETE (Remover por ID, apenas gastos do próprio usuário)
app.delete('/api/gastos/:id', exigirLogin, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID de gasto inválido.' });
    }
    try {
        const result = await Gasto.findOneAndDelete({
            _id: req.params.id,
            usuario: req.usuario.login
        });
        
        if (!result) {
            return res.status(404).json({ message: 'Gasto não encontrado.' });
        }
        
        // Retorna 200 OK
        res.status(200).json({ message: 'Gasto removido com sucesso.' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao remover gasto', error: err.message });
    }
});


// ROTAS DE ACESSOS (nome, data e horário de quem usou o sistema)

app.get('/api/admin', (req, res) => {
    if (!ehAdmin(req)) {
        return res.status(401).json({ message: 'Senha de admin inválida.' });
    }
    res.json({ admin: true });
});

app.get('/api/acessos', talvezLogin, async (req, res) => {
    try {
        const acessos = await listarRegistros(req, res, Acesso, 'dataHora');
        if (acessos) res.json(acessos);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar acessos', error: err.message });
    }
});

app.post('/api/acessos', exigirLogin, async (req, res) => {
    try {
        // Data/hora sempre definida pelo servidor no momento do acesso
        const acessoSalvo = await registrarAcesso(req, req.usuario);
        res.status(201).json(acessoSalvo);
    } catch (err) {
        res.status(400).json({ message: 'Erro ao registrar acesso', error: err.message });
    }
});

// ROTAS DE FEEDBACKS

app.get('/api/feedbacks', talvezLogin, async (req, res) => {
    try {
        const feedbacks = await listarRegistros(req, res, Feedback, 'data');
        if (feedbacks) res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar feedbacks', error: err.message });
    }
});

app.post('/api/feedbacks', exigirLogin, async (req, res) => {
    try {
        const { nota, facilidade, recomendaria, comentario } = req.body;
        const feedback = new Feedback({ nome: req.usuario.nome, nota, facilidade, recomendaria, comentario });
        const feedbackSalvo = await feedback.save();
        res.status(201).json(feedbackSalvo);
    } catch (err) {
        res.status(400).json({ message: 'Erro ao registrar feedback', error: err.message });
    }
});

// Em produção, o backend também serve o frontend compilado
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(FRONTEND_DIST));
app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Back-end rodando na porta ${PORT}`);
});