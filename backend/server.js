const express = require('express');
const cors = require('cors');
const http = require('http'); // Modulo nativo di Node
const { Server } = require('socket.io');

const app = express();
const PORT = 3000;

const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const User = require('./models/User'); 
const Session = require('./models/Session');
const authRoutes = require('./routes/auth'); //importiamo il file delle rotte 

// Middleware fondamentali
app.use(cors()); // Permette a React (porta 5173) di fare richieste a Express (porta 3000)
app.use(express.json()); // Permette di leggere i dati in formato JSON dal frontend
app.use(cookieParser()); //Permette di leggere e tradurre i cookie che il broser invia al server
app.use('/api/auth', authRoutes);

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


//Gestione della home funzioni js per queri al DB

const ottieniUtente = (nomeUtente) => {
    return User.findOne({ username: nomeUtente }); 
};

const ottieniImmagine = (utente) => {
    if (utente && utente.profilePicture) {
        return utente.propic;
    }
    return '/file/propic/default.jpg';
};

app.get('/api/user/test', (req, res) => {
    const usernameCercato = 'Magnifico Rettore'; // Il tuo account di test

    // Chiamiamo la prima funzione...
    ottieniUtente(usernameCercato)
        .then(utenteTrovato => {
            // Controllo di sicurezza: e se l'utente non esiste?
            if (!utenteTrovato) {
                return res.status(404).json({ error: 'Utente non trovato' });
            }

            // Chiamiamo la seconda funzione passandogli l'utente appena trovato!
            const immagineProfilo = ottieniImmagine(utenteTrovato);

            // Assembliamo la risposta e la inviamo a React in formato JSON
            res.json({
                username: utenteTrovato.username,
                propic: immagineProfilo
            });
        })
        .catch(error => {
            // Catturiamo qualsiasi errore (es. database disconnesso) per evitare il crash del server
            console.error('Errore nel recupero utente:', error);
            res.status(500).json({ error: 'Errore interno del server' });
        });
});