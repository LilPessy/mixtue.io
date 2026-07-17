const express = require('express');
const cors = require('cors');
const http = require('http'); // Modulo nativo di Node
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const PORT = 3000;

const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User'); 
const Session = require('./models/Session');
const authRoutes = require('./routes/auth'); //importiamo il file delle rotte 

// Middleware fondamentali
app.use(cors()); // Permette a React (porta 5173) di fare richieste a Express (porta 3000)
app.use(express.json()); // Permette di leggere i dati in formato JSON dal frontend
app.use(cookieParser()); //Permette di leggere e tradurre i cookie che il broser invia al server
app.use('/api/auth', authRoutes);
// Questo dice a Express: "Tutto quello che c'è nella cartella 'public', 
// rendilo accessibile dal browser sotto l'indirizzo /public"
// Assicurati di avere 'const path = require("path");' in alto nel file
// Trova questa riga e modificala COSÌ:
app.use('/public', express.static(path.join(__dirname, 'public')));
//Connessione Db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connesso a MongoDB Atlas!');
    })
    .catch((err) => {
        console.error('❌ Errore di connessione a MongoDB:', err);
    });
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

// 1. Importiamo ENTRAMBI i middleware estraendoli dall'oggetto
const { uploadPropic, uploadTrack } = require('./middlewares/upload'); // aggiusta il percorso se serve

// 2. ROTTA PER LA FOTO PROFILO
// Si aspetta che dal frontend il file si chiami 'image'
app.post('/api/upload/propic', uploadPropic.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nessuna immagine caricata" });
    }
    // Qui potreste anche aggiornare direttamente il campo 'propic' dell'utente nel DB
    res.status(200).json({ 
        message: "Foto profilo aggiornata", 
        fileName: req.file.filename 
    });
});

// 3. ROTTA PER LE TRACCE AUDIO
// Si aspetta che dal frontend il file si chiami 'audioFile'
app.post('/api/upload/track', uploadTrack.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nessuna traccia caricata" });
    }
    res.status(200).json({ 
        message: "Traccia audio caricata per il mixer", 
        fileName: req.file.filename 
    });
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

//da togliere
const fs = require('fs');
const percorsoTest = path.join(__dirname, '..', 'public', 'propic', '1.jpg');

console.log("Cerco il file qui:", percorsoTest);
console.log("Il file esiste davvero?", fs.existsSync(percorsoTest));

// Avvio del server
server.listen(PORT, () => {
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
});


//Gestione della home funzioni js per queri al DB

const ottieniUtente = (nomeUtente) => {
    return User.findOne({ username: nomeUtente })
        .populate({
            path: 'activeSessions', // Trasforma gli ID delle sessioni in oggetti completi
            populate: {
                path: 'ownerId', // Dentro ogni sessione, va a prendere i dati di chi l'ha creata
                select: 'username' // Ci facciamo dare solo lo username per comodità
            }
        }); 
};

const ottieniImmagine = (utente) => {
    if (utente && utente.propic) {
        return utente.propic;
    }
    return '/file/propic/default.jpg';
};

app.get('/api/user/test', (req, res) => {
    // Ovviamente, teniamo il nostro VIP!
    const usernameCercato = 'Magnifico Rettore'; 

    ottieniUtente(usernameCercato)
        .then(utenteTrovato => {
            if (!utenteTrovato) {
                return res.status(404).json({ error: 'Utente non trovato' });
            }

            const immagineProfilo = ottieniImmagine(utenteTrovato);

            // Prepariamo le due "scatole" vuote
            const iTuoiProgetti = [];
            const collaborazioni = [];

            // Controlliamo se l'utente ha delle sessioni attive prima di ciclarle
            if (utenteTrovato.activeSessions && utenteTrovato.activeSessions.length > 0) {
                
                // Lo smistatore ANTIPROIETTILE
                utenteTrovato.activeSessions.forEach(sessione => {
                    
                    // 1. SICUREZZA: Se la sessione per qualche motivo non ha un ownerId, la saltiamo ed evitiamo il crash!
                    if (!sessione.ownerId) {
                        console.log("Attenzione: Trovata sessione senza proprietario:", sessione.name);
                        return; 
                    }

                    // 2. Trasformiamo gli ID in stringhe semplici. È il metodo più sicuro al 100% per confrontarli
                    const idProprietario = sessione.ownerId._id ? sessione.ownerId._id.toString() : sessione.ownerId.toString();
                    const idRettore = utenteTrovato._id.toString();

                    if (idProprietario === idRettore) {
                        
                        // SÌ: È un progetto creato da lui!
                        iTuoiProgetti.push({
                            id: sessione._id,
                            nome: sessione.name // Il nome del progetto
                        });
                        
                    } else {
                        
                        // NO: È un progetto di qualcun altro (es. di Daniele) a cui sta collaborando
                        collaborazioni.push({
                            id: sessione._id,
                            nome: sessione.name, 
                            proprietario: sessione.ownerId.username || "Sconosciuto"
                        });
                        
                    }
                });
            }

            // Assembliamo il JSON finale e lo spediamo a React!
            res.json({
                username: utenteTrovato.username,
                propic: immagineProfilo,
                iTuoiProgetti: iTuoiProgetti,
                collaborazioni: collaborazioni
            });
        })
        .catch(error => {
            console.error('Errore nel recupero utente:', error);
            res.status(500).json({ error: 'Errore interno del server' });
        });
});