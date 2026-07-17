import React, { useState, useEffect } from 'react';
import './Navbar.css';
function Navbar({username, propic}){

    const url = "http://localhost:3000" + propic

    // 1. Otteniamo l'ora attuale (un numero da 0 a 23)
    const oraAttuale = new Date().getHours();

// 2. Prepariamo la variabile per il saluto
    let saluto = "Buongiorno"; // Partiamo col buongiorno di default

// 3. Cambiamo il saluto in base alla fascia oraria
    if (oraAttuale >= 13 && oraAttuale < 18) {
    saluto = "Buon pomeriggio";
    } else if (oraAttuale >= 18 || oraAttuale < 23) {
    // Dalle 18:00 fino alle 4:59 del mattino
    saluto = "Buonasera"; 
    }else if (oraAttuale >= 23 || oraAttuale < 5) {
    // Dalle 23:00 fino alle 4:59 del mattino
    saluto = "Buonanotte"; 
    }

    return(
        <nav className='navbar'>
            <div className='Names'>
                <h1 className='saluto'>{saluto}</h1>
                <h2>{username}</h2>
            </div>

            <div className='Profile'>
                {propic ? (
                    <img className='profile-pic' src={url} alt="Immagine profilo" />
                ) : (
                    <div className='placeholder'>Ospite</div>
                )}
            </div>
        </nav>
        
    )
}
export default Navbar;