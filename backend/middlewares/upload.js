const multer = require('multer');

// 1. Storage per le Foto Profilo
const propicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/propic/'); 
  },
  filename: function (req, file, cb) {
    // Sostituiamo anche gli spazi nel nome del file con degli underscore per evitare bug negli URL
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-propic-' + safeName);
  }
});

// 2. Storage per le Tracce Audio del Mixer
const trackStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/tracks/'); // IMPORTANTE: create questa cartella fisicamente nel progetto!
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-track-' + safeName);
  }
});

// Creiamo i due "caselli" multer
const uploadPropic = multer({ storage: propicStorage });
const uploadTrack = multer({ storage: trackStorage });

// Li esportiamo entrambi come oggetto
module.exports = {
    uploadPropic,
    uploadTrack
};