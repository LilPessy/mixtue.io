import React, { useState } from 'react';
import FormField from './FormField';
import Button from './Button';
import './Registration.css';

const Registration = () => {
  // 1. Gli stati vanno dentro il componente
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');

  // 2. Anche la funzione va DENTRO il componente, prima del return
  const handleRegister = () => {
    if (password !== confermaPassword) {
      alert("Le password non coincidono!");
      return;
    }

    const userData = {
      nome,
      cognome,
      username,
      email,
      password
    };

    console.log("Dati pronti per il salvataggio:", userData);
  };
  return (
    <div className="registration-container">
      <h1>Registrazione</h1>
      
     return (
    <div className="registration-container">
      
      {/* Sezione Intestazione con Logo (ricreata in CSS o con un'immagine) */}
      <div className="header-section">
        <div className="logo-circle">
          {/* Qui puoi inserire il tag <img src="..."/> del logo MixTue */}
          <h2 className="logo-text">MixTue.io</h2>
        </div>
      </div>

      <h1 className="main-title">Crea il tuo Account</h1>

      {/* Contenitore dei campi */}
      <div className="form-container">
        <FormField
          label="Nome"
          placeholder="Inserisci il tuo nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <FormField
          label="Cognome"
          placeholder="Inserisci il tuo nome" /* Mantenuto come da immagine, ma potresti volerlo cambiare in "tuo cognome" */
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
      </div>

      {/* 3. Utilizzo del tuo componente Button custom */}
      <div className="button-container">
        <Button 
          text="Crea Account" 
          callback={handleRegister} 
        />
      </div>

      {/* Link finale */}
      <div className="login-link-container">
        <a href="/login" className="login-link">Ho già un account</a>
      </div>

    </div>
  );
      
      {/* Qui leghi la funzione al tuo Button */}
      <Button onClick={handleRegister}>
        Registrati
      </Button>
    </div>
  );
}; // <-- Chiusura corretta del componente Registration

// 4. Esportazione fondamentale per il Router
export default Registration;