import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

function MixerActions({ username }) {
    // 1. GLI STATI
    // Questo stato decide se la barra di input è visibile (true) o nascosta (false). Di base è nascosta.
    const [mostraInput, setMostraInput] = useState(false);
    
    // Questo stato memorizza il codice che l'utente sta digitando.
    const [codiceStanza, setCodiceStanza] = useState('');

    // Inizializziamo il navigatore per cambiare pagina
    const navigate = useNavigate();

    // 2. I GESTORI DEGLI EVENTI

    // Funzione per creare un nuovo mixer nel database
    const gestisciNuovoMixer = async () => {
    // Controllo di sicurezza
    if (!username) {
        console.error("Aspetta, utente non ancora caricato!");
        return;
    }

    // 1. ECCO IL PROMPT (L'ALERT CON CAMPO DI TESTO)
    // Chiediamo il nome all'utente. Il secondo parametro è il testo suggerito di base.
    const nomeProgettoScelto = window.prompt("Come vuoi chiamare il tuo nuovo progetto?", `Mix di ${username}`);

    // 2. Controllo: Se l'utente clicca "Annulla" o cancella tutto lasciando vuoto, annulliamo la creazione!
    if (!nomeProgettoScelto || nomeProgettoScelto.trim() === "") {
        console.log("Creazione annullata dall'utente.");
        return; 
    }

    try {
        const response = await fetch('http://localhost:3000/api/sessions/crea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 3. Spediamo AL BACKEND sia l'username che il nuovo NOME DEL PROGETTO
            body: JSON.stringify({ 
                username: username,
                projectName: nomeProgettoScelto 
            }) 
        });

        if (response.ok) {
            const nuovaStanza = await response.json();
            console.log("Stanza creata con successo! ID:", nuovaStanza._id);
            navigate(`/mixer/${nuovaStanza._id}`); 
        } else {
            console.error("Errore dal server durante la creazione");
        }
    } catch (error) {
        console.error("Errore di connessione al server:", error);
    }
};

    const gestisciClickCollabora = () => {
        // Quando clicchi "Collabora", inverte lo stato. 
        // Così se riclicchi, si richiude!
        setMostraInput(!mostraInput);
    };

    const gestisciEntra = () => {
        // Qui in futuro metteremo la logica per far entrare l'utente nella stanza
        console.log("Richiesta di entrare nella stanza:", codiceStanza);
    };

    return (
        <div className="mixer-actions-container">
            {/* Riga con i due bottoni principali */}
            <div className="action-buttons-row">
                {/* Aggiunto l'evento onClick per creare il mixer */}
                <button className="action-btn" onClick={gestisciNuovoMixer}>
                    <span className="icon">🎛️</span> {/* Qui potrai mettere le tue icone SVG */}
                    Nuovo Mixer
                </button>

                <button className="action-btn" onClick={gestisciClickCollabora}>
                    <span className="icon">👥</span>
                    Collabora
                </button>
            </div>

            {/* 3. RENDERING CONDIZIONALE */}
            {/* Questa parte di codice viene stampata a schermo SOLO SE mostraInput è true */}
            {mostraInput && (
                <div className="join-room-container">
                    <input 
                        type="text" 
                        className="room-input"
                        placeholder="Inserisci il codice stanza" 
                        value={codiceStanza}
                        // Ogni volta che digiti una lettera, aggiorna lo stato
                        onChange={(e) => setCodiceStanza(e.target.value)} 
                    />
                    <button className="entra-btn" onClick={gestisciEntra}>
                        Entra
                    </button>
                </div>
            )}
        </div>
    );
}

export default MixerActions;