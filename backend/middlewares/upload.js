const multer = require('multer');

// Configurazione dello storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/propic/'); // Assicurati che questa cartella ESISTA nel tuo progetto!
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// FONDAMENTALE: Esporta direttamente l'oggetto 'upload'
module.exports = upload;