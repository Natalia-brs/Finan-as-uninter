const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const UsuarioSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    login: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: 80
    },
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório'],
        trim: true,
        maxlength: [80, 'O nome não pode ter mais de 80 caracteres']
    },
    senhaHash: {
        type: String,
        required: true
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
