// backend/models/Gasto.js
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const GastoSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    usuario: {
        type: String,
        required: [true, 'O usuário é obrigatório'],
        trim: true,
        lowercase: true,
        maxlength: 80,
        index: true
    },
    descricao: {
        type: String,
        required: [true, 'A descrição é obrigatória'],
        trim: true,
        maxlength: [100, 'A descrição não pode ter mais de 100 caracteres']
    },
    valor: {
        type: Number,
        required: [true, 'O valor é obrigatório'],
        min: [0.01, 'O valor deve ser positivo']
    },
    categoria: {
        type: String,
        enum: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Outros'],
        default: 'Outros'
    },
    data: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gasto', GastoSchema);