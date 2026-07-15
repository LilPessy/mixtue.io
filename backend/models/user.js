const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },

    propic:{
        type: String,
        required:true
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
    }]
},);

module.exports = mongoose.model('User', userSchema);
