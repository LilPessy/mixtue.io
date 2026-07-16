const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const upload = require('../middlewares/upload');//importazione della confiugurazione di Multer 

app.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    //Ricerca all'interno del database per verificare che la mail o il nome utente non siano già presenti
    const existingUser = await User.findOne({ 
      $or: [ 
        { email: email }, 
        { username: username } 
      ] 
    });

    //Necessario per capire quale tra email o username sia già presente 
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Questa email è già registrata" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Questo nome utente è già in uso" });
      }
    }

    // salt e hashing della password 
    const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		
    if (req.file) {
      userData.propic = '/public/propic/' + req.file.filename; 
    }

    const newUser = new User({ 
      username: username,
      email: email, 
      password: hashedPassword 
    });
    
    await newUser.save();

    res.status(201).json({ message: "Utente creato con successo" });
  } catch (error) {
    res.status(500).json({ message: "Errore del server" });
  }
});

app.post('/login', async (req, res) => {
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
  //stiamo inviando il refresh token a React come un "Cookie di sicurezza"
    httpOnly: true,
    //impedisce a JavaScript sul browser di leggere i cookie 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  res.json({ accessToken: accessToken });
  //invia l'Access Token al frontend in formato leggibile
});