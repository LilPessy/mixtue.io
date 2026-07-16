import React, { useState } from 'react';
import FormField from './FormField';
import Button from './Button';
import './Registration.css';

const Registration = () => {
  // Definiamo gli stati per tutti i campi del design
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
}