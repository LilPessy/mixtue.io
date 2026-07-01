require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware base
app.use(cors());
app.use(express.json()); // Fondamentale per leggere i body in JSON delle richieste POST

// Route di test
app.get('/', (req, res) => {
    res.send('Backend di Mixtue.io operativo!');
});

// Connessione a MongoDB e avvio del server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log('🔥 Connesso con successo a MongoDB Atlas!');
      
      // Avviamo Express solo se il database è pronto
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
          console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
      });
  })
  .catch((error) => {
      console.error('❌ Errore di connessione al database:', error.message);
  });