const express = require('express');
const cors = require('cors');
const http = require('http'); // Modulo nativo di Node
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Middleware fondamentali
app.use(cors()); // Permette a React (porta 5173) di fare richieste a Express (porta 3000)
app.use(express.json()); // Permette di leggere i dati in formato JSON dal frontend
app.use(cookieParser()); //Permette di leggere e tradurre i cookie che il broser invia al server

// Creazione del server HTTP unificato (serve per far convivere Express e Socket.io)
const server = http.createServer(app);

// Inizializzazione di Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // L'indirizzo del tuo frontend Vite
        methods: ["GET", "POST"]
    }
});

// --- ROTTE EXPRESS (API REST) ---

app.get('/api/test', (req, res) => {
    res.json({ message: "Il backend di Mixtue.io è vivo e vegeto!" });
});

// Qui il tuo collega potrà aggiungere le altre rotte (es. /api/sessions, /api/users)


// --- GESTIONE SOCKET.IO (REAL-TIME) ---

io.on('connection', (socket) => {
    console.log(`Un utente si è connesso: ${socket.id}`);

    // Quando un utente chiude la scheda
    socket.on('disconnect', () => {
        console.log(`Utente disconnesso: ${socket.id}`);
    });
});

// Avvio del server
server.listen(PORT, () => {
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
});