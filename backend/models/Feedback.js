// backend/models/Feedback.js
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const FeedbackSchema = new mongoose.Schema({
    _id: { type: String, default: () => randomUUID() },
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório'],
        trim: true,
        maxlength: [80, 'O nome não pode ter mais de 80 caracteres']
    },
    nota: {
        type: Number,
        required: [true, 'A nota é obrigatória'],
        min: [1, 'A nota mínima é 1'],
        max: [5, 'A nota máxima é 5']
    },
    facilidade: {
        type: String,
        enum: ['Muito fácil', 'Fácil', 'Razoável', 'Difícil'],
        required: [true, 'Informe a facilidade de uso']
    },
    recomendaria: {
        type: Boolean,
        default: true
    },
    comentario: {
        type: String,
        trim: true,
        maxlength: [1000, 'O comentário não pode ter mais de 1000 caracteres']
    },
    data: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
