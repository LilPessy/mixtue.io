import React, { useState, useEffect } from 'react';

function Navbar(){
    // 1. LO STATO: La "memoria" del componente. 
    // All'inizio parte con dei valori di default, in attesa che il server risponda.
    const [user, setUser] = useState({ 
        username: 'Caricamento...', 
        propic: '' 
    });

    // 2. L'EFFETTO: Questa funzione scatta in automatico appena la Navbar appare a schermo.
    useEffect(() => {
        // Facciamo la chiamata alla rotta API che abbiamo appena creato nel backend
        fetch('http://localhost:3000/api/user/test')
            .then(response => response.json())
            .then(data => {
                // Quando arrivano i dati, aggiorniamo la "memoria" (lo Stato). 
                // React se ne accorgerà e aggiornerà la grafica da solo!
                setUser({
                    username: data.username,
                    propic: data.propic ? `http://localhost:3000${data.propic}` : '' 
                });
            })
            .catch(error => {
                console.error("Errore di connessione:", error);
                setUser({ username: 'Ospite', propic: '' });
            });
    }, []); // ⚠️ L'array vuoto è FONDAMENTALE: dice a React "Fai questa chiamata UNA SOLA VOLTA all'avvio".

    return(
        <nav className='navbar'>
            <div className='Names'>
                <h1>Ciao! Vuoi un mix tu e io?</h1>
                <h2>{user.username}</h2>
            </div>

            <div className='Profile'>
                {user.propic ? (
                    <img src={user.propic} alt="Immagine Profilo" />
                ) : (
                    <div className='placeholder'>Nessuna immagine</div>
                )}
            </div>
        </nav>
    )
}
export default Navbar;