const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurazione Cloudinary (prende i dati dal tuo file .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 1. Storage per le Foto Profilo su Cloudinary
const propicStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mixtue_propics',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Formati immagine consentiti
        public_id: (req, file) => {
            // Rimuoviamo l'estensione originale e gli spazi per il nome su Cloudinary
            const safeName = file.originalname.replace(/\s+/g, '_').split('.')[0];
            return Date.now() + '-propic-' + safeName;
        }
    },
});

// 2. Storage per le Tracce Audio su Cloudinary
const trackStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mixtue_tracks',
        resource_type: 'video', // FONDAMENTALE: Cloudinary tratta i file audio (.mp3, .wav) come 'video'
        public_id: (req, file) => {
            const safeName = file.originalname.replace(/\s+/g, '_').split('.')[0];
            return Date.now() + '-track-' + safeName;
        }
    },
});

// Creiamo i due "caselli" multer con la nuova destinazione Cloudinary
const uploadPropic = multer({ storage: propicStorage });
const uploadTrack = multer({ storage: trackStorage });

// Li esportiamo entrambi come oggetto
module.exports = {
    uploadPropic,
    uploadTrack
};