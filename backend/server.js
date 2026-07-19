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
const authRoutes = require('./routes/auth'); // importiamo il file delle rotte 

// Middleware fondamentali
// Permette a React (porta 5173) di fare richieste a Express (porta 3000)
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173/';

app.use(cors({
    origin: frontendURL, 
    credentials: true 
}));


app.use(express.json()); // Permette di leggere i dati in formato JSON dal frontend
app.use(cookieParser()); // Permette di leggere e tradurre i cookie che il browser invia al server
app.use('/api/auth', authRoutes);

// Questo dice a Express: "Tutto quello che c'è nella cartella 'public', 
// rendilo accessibile dal browser sotto l'indirizzo /public"
app.use('/public', express.static(path.join(__dirname, 'public')));

// Connessione Db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connesso a MongoDB Atlas!');
    })
    .catch((err) => {
        console.error('❌ Errore di connessione a MongoDB:', err);
    });

// Creazione del server HTTP unificato (serve per far convivere Express e Socket.io)
const server = http.createServer(app);

// Inizializzazione di Socket.io
const io = new Server(server, {
    cors: {
        origin: frontendURL,
        methods: ["GET", "POST"]
    }
});

// --- FUNZIONI DI SUPPORTO ---

// La funzione per l'immagine di default
const ottieniImmagine = (utente) => {
    if (utente && utente.propic) {
        return utente.propic;
    }
    // Percorso corretto per la cartella statica
    return '/public/propic/default.jpg'; 
};

// --- ROTTE EXPRESS (API REST) ---

app.get('/api/test', (req, res) => {
    res.json({ message: "Il backend di Mixtue.io è vivo e vegeto!" });
});


// GUARDA QUI: ho aggiunto "async" prima di (req, res)
app.get('/api/session/:id', async (req, res) => {
    try {
        // Estraiamo l'id specifico
        const sessionId = req.params.id;
        
        const sessione = await Session.findById(sessionId);
        
        if (!sessione) {
            return res.status(404).json({ message: "Sessione non trovata" });
        }

        // Usiamo roomeCode come scritto nel tuo schema!
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

// 1. Importiamo ENTRAMBI i middleware estraendoli dall'oggetto
const { uploadPropic, uploadTrack } = require('./middlewares/upload');

// 2. ROTTA PER LA FOTO PROFILO
app.post('/api/upload/propic', uploadPropic.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nessuna immagine caricata" });
    }
    res.status(200).json({ 
        message: "Foto profilo aggiornata", 
        fileName: req.file.filename 
    });
});

// 3. ROTTA PER LE TRACCE AUDIO
app.post('/api/upload/track', uploadTrack.single('audioFile'), async (req, res) => {
    try {
        // 1. Controlliamo che il file sia arrivato
        if (!req.file) {
            return res.status(400).json({ error: "Nessuna traccia caricata" });
        }

        // 2. Leggiamo l'ID della sessione che React ci ha mandato nel formData
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "ID della sessione mancante" });
        }

        // 3. Cerchiamo la sessione nel database
        const sessione = await Session.findById(sessionId);

        if (!sessione) {
            return res.status(404).json({ error: "Sessione non trovata" });
        }

        // 4. Creiamo il percorso e il nome che salveremo nel DB
        const urlTraccia = `/public/tracks/${req.file.filename}`;
        
        // Usiamo il nome originale del file caricato (es. "basso.mp3") o quello generato
        const nomeTraccia = req.file.originalname || req.file.filename;

        // 5. Creiamo l'oggetto traccia seguendo il tuo Schema Mongoose
        const nuovaTraccia = {
            name: nomeTraccia,
            fileUrl: urlTraccia,
        };

        // 6. Infiliamo la traccia nell'array della sessione
        sessione.tracks.push(nuovaTraccia);

        // 7. Salviamo la sessione aggiornata nel DB
        await sessione.save();

        // 8. Rispondiamo a React con successo, inviando i dati della traccia appena salvata
        res.status(200).json({ 
            message: "Traccia aggiunta con successo alla sessione", 
            fileName: req.file.filename,
            // Restituiamo la traccia così com'è stata salvata nel DB (con il suo _id generato da Mongoose)
            track: sessione.tracks[sessione.tracks.length - 1] 
        });

    } catch (error) {
        console.error("Errore durante il salvataggio della traccia nel DB:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// ROTTA PER AGGIORNARE LO STATO DI UNA TRACCIA (Volume, EQ, Mute)
// ROTTA PER SALVARE LO STATO DELL'INTERO MIXER
app.put('/api/session/:sessionId/state/bulk', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const tracksState = req.body; // Questo ora è un array di oggetti!

        const sessione = await Session.findById(sessionId);
        if (!sessione) {
            return res.status(404).json({ error: "Sessione non trovata" });
        }

        // Cicliamo l'array che ci arriva dal frontend
        tracksState.forEach(trackData => {
            // Cerchiamo la traccia corrispondente nel database
            const tracciaDB = sessione.tracks.id(trackData.trackId);
            
            if (tracciaDB) {
                // Aggiorniamo i valori
                tracciaDB.state.volume = trackData.volume;
                tracciaDB.state.isMuted = trackData.isMuted;
                tracciaDB.state.eq.high = trackData.eq.high;
                tracciaDB.state.eq.mid = trackData.eq.mid;
                tracciaDB.state.eq.low = trackData.eq.low;
            }
        });

        // Salviamo la sessione con tutte le tracce aggiornate in un colpo solo
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

// ROTTA PER UNIRSI A UNA SESSIONE ESISTENTE (COLLABORA) - VERSIONE SICURA
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

        // 1. Cerchiamo l'utente
        const utente = await User.findOne({ username: nomeUtente });
        
        // 2. CERCHIAMO LA SESSIONE (Questa riga mancava!)
        const sessione = await Session.findById(sessionId);

        // 3. Ora possiamo fare il controllo in sicurezza
        if (!utente || !sessione) {
            return res.status(404).json({ error: 'Utente o stanza non trovati' });
        }

        const isOwner = sessione.ownerId.toString() === utente._id.toString();

        if (isOwner) {
            // Se è il proprietario, distruggiamo la stanza
            await Session.findByIdAndDelete(sessionId);
            
            // E la togliamo dalle sessioni attive di TUTTI gli utenti
            await User.updateMany(
                { activeSessions: sessionId },
                { $pull: { activeSessions: sessionId } }
            );
        } else {
            // Se è un collaboratore, lo togliamo dalla stanza
            sessione.collaborators = sessione.collaborators.filter(id => id.toString() !== utente._id.toString());
            await sessione.save();

            // E togliamo la stanza dal SUO profilo
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

    // 1. Quando un utente apre un progetto, lo facciamo entrare nella sua "Room"
    socket.on('join-room', (sessionId) => {
        socket.join(sessionId);
        console.log(`Utente ${socket.id} è entrato nella stanza ${sessionId}`);
    });

    // 2. Quando qualcuno muove un fader o un knob
    socket.on('send-mixer-update', (data) => {
        // data conterrà roba tipo: { sessionId, trackId, parametro, valore }
        
        // socket.to(stanza).emit manda il pacchetto a TUTTI quelli nella stanza 
        // TRANNE a chi ha appena mosso il fader (altrimenti il suo fader scatterebbe)
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