const express = require('express');
const router = express.Router(); // ✅ Usiamo il router
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // ✅ U maiuscola per sicurezza!
const jwt = require('jsonwebtoken');

const {uploadPropic} = require('../middlewares/upload');

const verifyToken = (req, res, next) => {
  // Il token arriva nell'header "Authorization" come "Bearer xyz123..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Access Token mancante" });

  jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token non valido o scaduto" });
    req.userId = decoded.id; // Salviamo l'ID estratto dal token
    next(); // Passiamo alla rotta vera e propria
  });
};

// ✅ Cambiato app.post in router.post
// ✅ Aggiunto upload.single('propic') come middleware per intercettare l'immagine
router.post('/register', uploadPropic.single('propic'), async (req, res) => {
  try {
    const { email, password, username, nome, cognome } = req.body;
    
    const existingUser = await User.findOne({ 
      $or: [ 
        { email: email }, 
        { username: username } 
      ] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Questa email è già registrata" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Questo nome utente è già in uso" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // ✅ Gestione corretta dell'immagine profilo
    let immagineProfilo = '/public/propic/default.jpg'; // Immagine di base se non ne caricano una
    
    if (req.file) {
      // Se Multer ha intercettato un file, usiamo il suo nome
      immagineProfilo = '/public/propic/' + req.file.filename; 
    }

    // ✅ Aggiunto il campo propic alla creazione dell'utente
    const newUser = new User({ 
      nome: nome,
      cognome: cognome,
      username: username,
      email: email, 
      password: hashedPassword,
      propic: immagineProfilo 
    });
    
    await newUser.save();

    res.status(201).json({ message: "Utente creato con successo" });
  } catch (error) {
    console.error(error); // Utile per capire cosa va storto nel terminale
    res.status(500).json({ message: "Errore del server" });
  }
});

// ✅ Cambiato app.post in router.post
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Cerchiamo l'utente
    const user = await User.findOne({ username: username });
    if (!user) return res.status(400).json({ message: "Utente non trovato" });

    // 2. Controlliamo la password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Password errata" });

    // 3. ECCO LE DUE RIGHE CHE ERANO SPARITE: Generiamo i token
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    // 4. Salviamo il refresh token nel DB per questo utente
    user.refreshToken = refreshToken;
    await user.save();

    // 5. Inviamo il cookie in modo sicuro al browser
    res.cookie('jwt', refreshToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    // 6. Rispondiamo a React dicendo che è andato tutto bene
    res.json({ accessToken: accessToken });
  } catch (error) {
    console.error("Errore nel login:", error);
    res.status(500).json({ message: "Errore durante il login" });
  }
});

// ✅ Cambiato app.get in router.get
router.get('/refresh', async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: "Non autorizzato" });
    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken: refreshToken });
    if (!user) return res.status(403).json({ message: "Accesso negato" });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) 
        return res.status(403).json({ message: "Token non valido" });

      const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore durante il refresh del token" });
  }
});

// La rotta vera e propria (es. in auth.js o un nuovo routes/user.js)
router.get('/me', verifyToken, async (req, res) => {
  try {
        // 1. Usiamo req.userId (dal token) invece del nome hardcodato!
        const utenteTrovato = await User.findById(req.userId).populate({
            path: 'activeSessions',
            populate: {
                path: 'ownerId',
                select: 'username'
            }
        });

        if (!utenteTrovato) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        const immagineProfilo = utenteTrovato.propic || '/public/propic/default.jpg';
        const iTuoiProgetti = [];
        const collaborazioni = [];

        // 2. La tua logica di smistamento (identica a prima, ma applicata all'utente reale)
        if (utenteTrovato.activeSessions && utenteTrovato.activeSessions.length > 0) {
            utenteTrovato.activeSessions.forEach(sessione => {
                if (!sessione.ownerId) return; 

                const idProprietario = sessione.ownerId._id ? sessione.ownerId._id.toString() : sessione.ownerId.toString();
                const idUtenteCorrente = utenteTrovato._id.toString();

                if (idProprietario === idUtenteCorrente) {
                    iTuoiProgetti.push({
                        id: sessione._id,
                        nome: sessione.name 
                    });
                } else {
                    collaborazioni.push({
                        id: sessione._id,
                        nome: sessione.name, 
                        proprietario: sessione.ownerId.username || "Sconosciuto"
                    });
                }
            });
        }

        // 3. Spediamo il pacchetto a React
        res.json({
            username: utenteTrovato.username,
            nome: utenteTrovato.nome,
            propic: immagineProfilo,
            iTuoiProgetti: iTuoiProgetti,
            collaborazioni: collaborazioni
        });

    } catch (error) {
        console.error('Errore nel recupero utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router;