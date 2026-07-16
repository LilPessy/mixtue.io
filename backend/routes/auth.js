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