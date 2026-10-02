// backend/models/Acesso.js
const mongoose = require('mongoose');

const AcessoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório'],
        trim: true,
        maxlength: [80, 'O nome não pode ter mais de 80 caracteres']
    },
    dataHora: {
        type: Date,
        default: Date.now
    },
    dispositivo: {
        type: String,
        trim: true,
        maxlength: 300
    }
});

module.exports = mongoose.model('Acesso', AcessoSchema);
