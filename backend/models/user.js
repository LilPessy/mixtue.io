const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    cognome: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },

    propic:{
        type: String,
        required:true,
        default: '/public/propic/1.jpg'
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },

    activeSessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    }],
    refreshToken: { type: String 

    }
},);

// Se mongoose.models.User esiste già, esporta quello. Altrimenti, crea il nuovo modello.
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
