import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importato useNavigate!
import FormField from '../components/FormField';
import Button from '../components/Button';
import './Registration.css';
import logo from '../assets/logo.png';

const Registration = () => {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [propic, setPropic] = useState(null);

  // 2. Inizializzati navigate e backendURL
  const navigate = useNavigate(); 
  const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Inserisci un indirizzo email valido!");
      return;
    }

    if (password !== confermaPassword) {
      alert("Le password non coincidono!");
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cognome', cognome);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (propic) {
      formData.append('propic', propic);
    }

    try {
      // 3. Sostituito localhost con backendURL dinamico
      const response = await fetch(`${backendURL}/api/auth/register`, {
        method: 'POST',
        body: formData, 
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registrazione completata con successo! Ora puoi effettuare il login.");
        // 4. Usiamo navigate per spostarci senza ricaricare la pagina o hardcodare porte!
        navigate('/login'); 
      } else {
        alert(data.message || "Errore durante la registrazione");
      }
    } catch (error) {
      console.error(error);
      alert("Impossibile connettersi al server. Assicurati che il backend sia acceso.");
    }
  };

  return (
    <div className="registration-container">
      
      <div className="bg-shape shape-top-left"></div>
      <div className="bg-shape shape-top-right"></div>
      <div className="bg-shape shape-mid-left"></div>
      
      <div className="header-section">
        <div className="logo-circle">
          <div className="logo-square">
            <img src={logo} alt="MixTue Logo" className="logo-image" />
          </div>
          <h2 className="logo-text">MixTue.io</h2>
        </div>
      </div>

      <h1 className="main-title">Crea il tuo Account</h1>

      <div className="form-container">
        <FormField
          label="Nome"
          placeholder="Inserisci il tuo nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <FormField
          label="Cognome"
          placeholder="Inserisci il tuo cognome" 
          value={cognome}
          onChange={(e) => setCognome(e.target.value)}
        />

        <FormField
          label="Username"
          placeholder="Inserisci il tuo username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <FormField
          label="Email"
          type="email"
          placeholder="Inserisci la tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormField
          label="Password"
          type="password"
          placeholder="Inserisci la password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <FormField
          label="Conferma Password"
          type="password"
          placeholder="Conferma la password"
          value={confermaPassword}
          onChange={(e) => setConfermaPassword(e.target.value)}
        />

        {/* 5. Tolto il value forzato per evitare bug di React */}
        <FormField
          label="Immagine Profilo"
          type="file"
          accept="image/*"
          onChange={(e) => setPropic(e.target.files[0])}
        />
      </div>

      <div className="button-container">
        <Button 
          text="Crea Account" 
          callback={handleRegister} 
        />
      </div>

      <div className="login-link-container">
        <Link to="/login" className="login-link">Ho giÃ  un account</Link>
      </div>

    </div>
  );
}; 

export default Registration;