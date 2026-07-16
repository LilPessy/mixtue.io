const express = require('express');
const router = express.Router(); // ✅ Usiamo il router
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // ✅ U maiuscola per sicurezza!
const jwt = require('jsonwebtoken');

const upload = require('../middlewares/upload');

// ✅ Cambiato app.post in router.post
// ✅ Aggiunto upload.single('propic') come middleware per intercettare l'immagine
router.post('/register', upload.single('propic'), async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
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
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ message: "Credenziali errate" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Credenziali errate" });

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', refreshToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({ accessToken: accessToken });
  } catch (error) {
    console.error(error);
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

module.exports = router;