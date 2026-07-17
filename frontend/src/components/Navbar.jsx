import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importiamo il navigatore!
import './Navbar.css';

function Navbar({ username, propic }) {
    // Stato per controllare se il menu a tendina è aperto
    const [menuAperto, setMenuAperto] = useState(false);
    const navigate = useNavigate();

    const url = propic ? "http://localhost:3000" + propic : null;

    // 1. Otteniamo l'ora attuale
    const oraAttuale = new Date().getHours();

    // 2. Prepariamo la variabile per il saluto
    let saluto = "Buongiorno"; 

    // 3. Cambiamo il saluto in base alla fascia oraria
    if (oraAttuale >= 13 && oraAttuale < 18) {
        saluto = "Buon pomeriggio";
    } else if (oraAttuale >= 18 || oraAttuale < 23) {
        saluto = "Buonasera"; 
    } else if (oraAttuale >= 23 || oraAttuale < 5) {
        saluto = "Buonanotte"; 
    }

    // Funzione per aprire/chiudere la tendina
    const toggleMenu = () => {
        setMenuAperto(!menuAperto);
    };

    // Funzione per il Logout
    const gestisciLogout = () => {
        // Eliminiamo il token di sicurezza
        localStorage.removeItem('accessToken');
        // Cacciamo l'utente al login!
        navigate('/login');
    };

    return (
        <nav className='navbar'>
            <div className='Names'>
                <h1 className='saluto'>{saluto}</h1>
                <h2>{username}</h2>
            </div>

            {/* Aggiungiamo l'onClick e position: relative per posizionare la tendina sotto l'immagine */}
            <div className='Profile' onClick={toggleMenu} style={{ cursor: 'pointer', position: 'relative' }}>
                {propic ? (
                    <img className='profile-pic' src={url} alt="Immagine profilo" />
                ) : (
                    <div className='placeholder'>Ospite</div>
                )}

                {/* IL MENU A TENDINA CHE APPARE QUANDO CLICCHI */}
                {menuAperto && (
                    <div className='dropdown-menu'>
                        <button onClick={gestisciLogout} className='logout-btn'>
                            🚪 Esci
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;