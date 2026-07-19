import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Navbar.css';
import exitIcon from '../assets/exit.png';

// 1. Variabile magica per il deploy
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function Navbar({ username, propic }) {
    const [menuAperto, setMenuAperto] = useState(false);
    const navigate = useNavigate();

    // 2. Controllo dinamico per Cloudinary o percorso locale
    let url = null;
    if (propic) {
        url = propic.startsWith('http') 
            ? propic 
            : `${backendURL}${propic.startsWith('/') ? '' : '/'}${propic}`;
    }

    const oraAttuale = new Date().getHours();
    let saluto = "Buongiorno"; 

    if (oraAttuale >= 13 && oraAttuale < 18) {
        saluto = "Buon pomeriggio";
    } else if (oraAttuale >= 18 && oraAttuale < 23) {
        saluto = "Buonasera"; 
    } else if (oraAttuale >= 23 || oraAttuale < 5) {
        saluto = "Buonanotte"; 
    }

    const toggleMenu = () => {
        setMenuAperto(!menuAperto);
    };

    const gestisciLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <nav className='navbar'>
            <div className='Names'>
                <h1 className='saluto'>{saluto}</h1>
                <h2>{username}</h2>
            </div>

            <div className='Profile' onClick={toggleMenu} style={{ cursor: 'pointer', position: 'relative' }}>
                {propic ? (
                    <img className='profile-pic' src={url} alt="Immagine profilo" />
                ) : (
                    <div className='placeholder'>Ospite</div>
                )}

                {menuAperto && (
                    <div className='dropdown-menu'>
                        <button onClick={gestisciLogout} className='logout-btn'>
                            <img src={exitIcon} alt="Exit" style={{ width: '18px', height: '18px' }} /> Esci
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;