import React, { useState } from 'react';
import FormField from '../components/FormField';
import Button from '../components/Button';
import './Registration.css'; // Riutilizziamo lo stesso CSS della registrazione!
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salviamo il token JWT per mantenere la sessione
        localStorage.setItem('accessToken', data.accessToken);
        alert("Accesso effettuato con successo!");
        // Qui si potrebbe usare useNavigate per portare l'utente nella Home
      } else {
        alert(data.message || "Credenziali errate");
      }
    } catch (error) {
      console.error(error);
      alert("Impossibile connettersi al server. Assicurati che il backend sia acceso.");
    }
  };

  return (
    <div className="registration-container">
      
      {/* Forme geometriche di sfondo */}
      <div className="bg-shape shape-top-left"></div>
      <div className="bg-shape shape-top-right"></div>
      <div className="bg-shape shape-mid-left"></div>
      
      {/* Sezione Intestazione con Logo */}
      <div className="header-section">
        <div className="logo-circle">
          <div className="logo-square">
            <img src={logo} alt="MixTue Logo" className="logo-image" />
          </div>
          <h2 className="logo-text">MixTue.io</h2>
        </div>
      </div>

      <h1 className="main-title">Accedi al tuo account</h1>

      {/* Contenitore dei campi */}
      <div className="form-container">
        <FormField
          label="Username"
          placeholder="Inserisci il tuo username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <FormField
          label="Password"
          type="password"
          placeholder="Inserisci la password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="button-container">
        {/* Nella tua foto c'è scritto "Crea Account" ma essendo il login ho messo "Accedi", se preferisci lo cambio! */}
        <Button 
          text="Accedi" 
          callback={handleLogin} 
        />
      </div>

      {/* Link per tornare alla registrazione */}
      <div className="login-link-container">
        <Link to="/registration" className="login-link">Non hai un account? Registrati</Link>
      </div>

    </div>
  );
};

export default Login;
