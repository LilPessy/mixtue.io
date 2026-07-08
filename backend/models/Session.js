const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    fileUrl: { type: String, required: true }, 
    state: {
        volume: { type: Number, default: 0, min: -60, max: 12 }, 
        isMuted: { type: Boolean, default: false },
        eq: {
            high: { type: Number, default: 0, min: -40, max: 12 },
            mid: { type: Number, default: 0, min: -40, max: 12 },   
            low: { type: Number, default: 0, min: -40, max: 12 }
        }
    }
});

const sessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
   
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    
    tracks: [trackSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);