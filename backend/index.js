// backend/index.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Gasto = require('./models/Gasto'); 
const Acesso = require('./models/Acesso');
const Feedback = require('./models/Feedback');

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

// Os gastos são separados pelo nome do usuário (sem diferenciar maiúsculas)
function usuarioDaRequisicao(req) {
    const usuario = req.query.usuario || req.body?.usuario;
    return typeof usuario === 'string' ? usuario.trim().toLowerCase() : '';
}

// ROTAS DA API DE GASTOS

// GET (Buscar os gastos do usuário)
app.get('/api/gastos', async (req, res) => {
    const usuario = usuarioDaRequisicao(req);
    if (!usuario) {
        return res.status(400).json({ message: 'Informe o usuário.' });
    }
    try {
        const gastos = await Gasto.find({ usuario }).sort({ data: -1 });
        res.json(gastos);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar gastos', error: err.message });
    }
});

// POST (Criar novo)
app.post('/api/gastos', async (req, res) => {
    try {
        const { descricao, valor, categoria } = req.body;
        const novoGasto = new Gasto({ descricao, valor, categoria, usuario: usuarioDaRequisicao(req) });
        const gastoSalvo = await novoGasto.save();
        res.status(201).json(gastoSalvo);
    } catch (err) {
        res.status(400).json({ message: 'Erro ao criar gasto', error: err.message });
    }
});

// DELETE (Remover por ID, apenas gastos do próprio usuário)
app.delete('/api/gastos/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID de gasto inválido.' });
    }
    try {
        const result = await Gasto.findOneAndDelete({
            _id: req.params.id,
            usuario: usuarioDaRequisicao(req)
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

app.get('/api/acessos', async (req, res) => {
    try {
        // O dispositivo (user-agent) fica só no banco, não é exposto na listagem
        const acessos = await Acesso.find().select('-dispositivo').sort({ dataHora: -1 });
        res.json(acessos);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar acessos', error: err.message });
    }
});

app.post('/api/acessos', async (req, res) => {
    try {
        // Data/hora sempre definida pelo servidor no momento do acesso
        const acesso = new Acesso({
            nome: req.body.nome,
            dispositivo: req.get('user-agent')
        });
        const acessoSalvo = await acesso.save();
        res.status(201).json(acessoSalvo);
    } catch (err) {
        res.status(400).json({ message: 'Erro ao registrar acesso', error: err.message });
    }
});

// ROTAS DE FEEDBACKS

app.get('/api/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ data: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar feedbacks', error: err.message });
    }
});

app.post('/api/feedbacks', async (req, res) => {
    try {
        const { nome, nota, facilidade, recomendaria, comentario } = req.body;
        const feedback = new Feedback({ nome, nota, facilidade, recomendaria, comentario });
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