const express = require('express');
const cors = require('cors');
const http = require('http'); // Modulo nativo di Node
const { Server } = require('socket.io');
const path = require('path');
const app = express();

// MODIFICA: Render assegnerà una porta in automatico, altrimenti usa la 3000 in locale
const PORT = process.env.PORT || 3000; 

const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User'); 
const Session = require('./models/Session');
const authRoutes = require('./routes/auth'); 

// Permette a React di fare richieste a Express
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: frontendURL, 
    credentials: true 
}));

app.use(express.json()); 
app.use(cookieParser()); 
app.use('/api/auth', authRoutes);

app.use('/public', express.static(path.join(__dirname, 'public')));

// Connessione Db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connesso a MongoDB Atlas!');
    })
    .catch((err) => {
        console.error('❌ Errore di connessione a MongoDB:', err);
    });

// Creazione del server HTTP unificato
const server = http.createServer(app);

// Inizializzazione di Socket.io
const io = new Server(server, {
    cors: {
        origin: frontendURL,
        methods: ["GET", "POST"]
    }
});

// --- FUNZIONI DI SUPPORTO ---

const ottieniImmagine = (utente) => {
    if (utente && utente.propic) {
        return utente.propic;
    }
    return '/public/propic/default.jpg'; 
};

// --- ROTTE EXPRESS (API REST) ---

app.get('/api/test', (req, res) => {
    res.json({ message: "Il backend di Mixtue.io è vivo e vegeto!" });
});

app.get('/api/session/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const sessione = await Session.findById(sessionId);
        
        if (!sessione) {
            return res.status(404).json({ message: "Sessione non trovata" });
        }

        res.json({ 
            roomCode: sessione.roomeCode,
            name: sessione.name,
            tracks: sessione.tracks
         });

    } catch (error) {
        console.error("Errore:", error);
        res.status(500).json({ message: "Errore del server" });
    }
});

const { uploadPropic, uploadTrack } = require('./middlewares/upload');

// 2. ROTTA PER LA FOTO PROFILO
app.post('/api/upload/propic', uploadPropic.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nessuna immagine caricata" });
    }
    res.status(200).json({ 
        message: "Foto profilo aggiornata", 
        // MODIFICA: Cloudinary restituisce il path (URL sicuro), non il filename!
        fileName: req.file.path 
    });
});

// 3. ROTTA PER LE TRACCE AUDIO
app.post('/api/upload/track', uploadTrack.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nessuna traccia caricata" });
        }

        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: "ID della sessione mancante" });
        }

        const sessione = await Session.findById(sessionId);
        if (!sessione) {
            return res.status(404).json({ error: "Sessione non trovata" });
        }

        // MODIFICA: Ora peschiamo l'URL direttamente da Cloudinary!
        const urlTraccia = req.file.path;
        const nomeTraccia = req.file.originalname;

        const nuovaTraccia = {
            name: nomeTraccia,
            fileUrl: urlTraccia,
        };

        sessione.tracks.push(nuovaTraccia);
        await sessione.save();

        res.status(200).json({ 
            message: "Traccia aggiunta con successo alla sessione", 
            fileName: req.file.path, // Rimandiamo indietro l'URL sicuro
            track: sessione.tracks[sessione.tracks.length - 1] 
        });

    } catch (error) {
        console.error("Errore durante il salvataggio della traccia nel DB:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// ROTTA PER AGGIORNARE LO STATO DI UNA TRACCIA (Volume, EQ, Mute)
app.put('/api/session/:sessionId/state/bulk', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const tracksState = req.body; 

        const sessione = await Session.findById(sessionId);
        if (!sessione) {
            return res.status(404).json({ error: "Sessione non trovata" });
        }

        tracksState.forEach(trackData => {
            const tracciaDB = sessione.tracks.id(trackData.trackId);
            if (tracciaDB) {
                tracciaDB.state.volume = trackData.volume;
                tracciaDB.state.isMuted = trackData.isMuted;
                tracciaDB.state.eq.high = trackData.eq.high;
                tracciaDB.state.eq.mid = trackData.eq.mid;
                tracciaDB.state.eq.low = trackData.eq.low;
            }
        });

        await sessione.save();
        res.status(200).json({ message: "Mixer salvato con successo!" });

    } catch (error) {
        console.error("Errore durante il salvataggio massivo:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// ROTTA PER CREARE UNA NUOVA SESSIONE DINAMICA
app.post('/api/sessions/crea', async (req, res) => {
    try {
        const nomeUtente = req.body.username; 
        const nomeProgetto = req.body.projectName; 

        if (!nomeUtente || !nomeProgetto) {
            return res.status(400).json({ error: 'Username o nome progetto mancanti nella richiesta' });
        }

        const utente = await User.findOne({ username: nomeUtente });
        if (!utente) {
            return res.status(404).json({ error: 'Utente non trovato nel database' });
        }

        const nuovaSessione = new Session({
            name: nomeProgetto, 
            ownerId: utente._id,
            collaborators: [], 
            tracks: []         
        });

        const sessioneSalvata = await nuovaSessione.save();

        utente.activeSessions.push(sessioneSalvata._id);
        await utente.save();

        res.status(201).json(sessioneSalvata);

    } catch (error) {
        console.error('Errore durante la creazione della sessione:', error);
        res.status(500).json({ error: 'Impossibile creare la stanza' });
    }
});

// ROTTA PER UNIRSI A UNA SESSIONE ESISTENTE 
app.post('/api/sessions/unisciti', async (req, res) => {
    try {
        const codiceStanza = req.body.roomCode;
        const nomeUtente = req.body.username;

        if (!codiceStanza || !nomeUtente) {
            return res.status(400).json({ error: 'Codice stanza o username mancanti' });
        }

        const utente = await User.findOne({ username: nomeUtente });
        if (!utente) {
            return res.status(404).json({ error: 'Utente non trovato nel database.' });
        }

        const sessione = await Session.findOne({ roomeCode: codiceStanza });
        if (!sessione) {
            return res.status(404).json({ error: 'Stanza non trovata. Controlla di aver scritto bene il codice!' });
        }

        const utenteIdStr = utente._id.toString();
        const ownerIdStr = sessione.ownerId.toString();

        if (ownerIdStr === utenteIdStr) {
            return res.status(400).json({ error: 'Sei già il proprietario di questa stanza! La trovi nella sezione "I tuoi progetti".' });
        }

        const isAlreadyCollaborator = sessione.collaborators.some(collabId => collabId.toString() === utenteIdStr);
        if (isAlreadyCollaborator) {
            return res.status(400).json({ error: 'Fai già parte di questa stanza come collaboratore! Controlla la sezione "Collaborazioni".' });
        }

        sessione.collaborators.push(utente._id);
        await sessione.save();

        const haGiaLaSessioneAttiva = utente.activeSessions.some(sessionId => sessionId.toString() === sessione._id.toString());
        if (!haGiaLaSessioneAttiva) {
            utente.activeSessions.push(sessione._id);
            await utente.save();
        }

        res.status(200).json({ sessionId: sessione._id });

    } catch (error) {
        console.error('Errore durante l\'unione alla sessione:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// ROTTA PER ELIMINARE O ABBANDONARE UN PROGETTO
app.delete('/api/sessions/elimina/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const nomeUtente = req.body.username; 

        if (!nomeUtente) {
            return res.status(400).json({ error: 'Username mancante' });
        }

        const utente = await User.findOne({ username: nomeUtente });
        const sessione = await Session.findById(sessionId);

        if (!utente || !sessione) {
            return res.status(404).json({ error: 'Utente o stanza non trovati' });
        }

        const isOwner = sessione.ownerId.toString() === utente._id.toString();

        if (isOwner) {
            await Session.findByIdAndDelete(sessionId);
            await User.updateMany(
                { activeSessions: sessionId },
                { $pull: { activeSessions: sessionId } }
            );
        } else {
            sessione.collaborators = sessione.collaborators.filter(id => id.toString() !== utente._id.toString());
            await sessione.save();

            utente.activeSessions = utente.activeSessions.filter(id => id.toString() !== sessionId.toString());
            await utente.save();
        }

        res.status(200).json({ message: 'Progetto rimosso con successo dalla tua bacheca!' });

    } catch (error) {
        console.error('Errore durante l\'eliminazione della sessione:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// --- GESTIONE SOCKET.IO (REAL-TIME) ---

io.on('connection', (socket) => {
    console.log(`🔌 Un utente si è connesso: ${socket.id}`);

    socket.on('join-room', (sessionId) => {
        socket.join(sessionId);
        console.log(`Utente ${socket.id} è entrato nella stanza ${sessionId}`);
    });

    socket.on('send-mixer-update', (data) => {
        socket.to(data.sessionId).emit('receive-mixer-update', data);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Utente disconnesso: ${socket.id}`);
    });
});

// Avvio del server
server.listen(PORT, () => {
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
});