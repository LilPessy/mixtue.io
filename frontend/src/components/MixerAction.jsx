import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

function MixerActions({ username }) {
    // GLI STATI
    const [mostraInput, setMostraInput] = useState(false);
    const [codiceStanza, setCodiceStanza] = useState('');
    const navigate = useNavigate();

    // 1. GESTIONE CREAZIONE NUOVO MIXER
    const gestisciNuovoMixer = async () => {
        if (!username) {
            console.error("Aspetta, utente non ancora caricato!");
            return;
        }

        const nomeProgettoScelto = window.prompt("Come vuoi chiamare il tuo nuovo progetto?", `Mix di ${username}`);

        if (!nomeProgettoScelto || nomeProgettoScelto.trim() === "") {
            console.log("Creazione annullata dall'utente.");
            return; 
        }

        try {
            const response = await fetch('http://localhost:3000/api/sessions/crea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, projectName: nomeProgettoScelto }) 
            });

            if (response.ok) {
                const nuovaStanza = await response.json();
                navigate(`/mixer/${nuovaStanza._id}`); 
            } else {
                console.error("Errore dal server durante la creazione");
            }
        } catch (error) {
            console.error("Errore di connessione al server:", error);
        }
    };

    // 2. GESTIONE APERTURA/CHIUSURA BARRA COLLABORA
    const gestisciClickCollabora = () => {
        setMostraInput(!mostraInput);
    };

    // 3. GESTIONE INGRESSO NELLA STANZA (LA NUOVA FUNZIONE!)
    const gestisciEntra = async () => {
        // Controlli di sicurezza base
        if (!username) {
            console.error("Aspetta, utente non ancora caricato!");
            return;
        }
        if (!codiceStanza || codiceStanza.trim() === "") {
            window.alert("Inserisci un codice stanza valido!");
            return;
        }

        try {
            // Facciamo la chiamata alla nuova rotta Node.js
            const response = await fetch('http://localhost:3000/api/sessions/unisciti', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    roomCode: codiceStanza, // Il codice digitato nell'input
                    username: username      // L'utente attuale
                })
            });

            if (response.ok) {
                // Se tutto va bene, prendiamo l'ID della stanza e navighiamo!
                const data = await response.json();
                console.log("Unito con successo! Vado al mixer:", data.sessionId);
                navigate(`/mixer/${data.sessionId}`);
            } else {
                // Se il backend ci blocca (es. "Sei già proprietario"), scatta l'alert!
                const errorData = await response.json();
                window.alert(errorData.error || "Impossibile unirsi alla stanza.");
            }
        } catch (error) {
            console.error("Errore di connessione al server:", error);
            window.alert("Si è verificato un errore di connessione.");
        }
    };

    return (
        <div className="mixer-actions-container">
            {/* Riga con i due bottoni principali */}
            <div className="action-buttons-row">
                <button className="action-btn" onClick={gestisciNuovoMixer}>
                    <span className="icon">🎛️</span>
                    Nuovo Mixer
                </button>

                <button className="action-btn" onClick={gestisciClickCollabora}>
                    <span className="icon">👥</span>
                    Collabora
                </button>
            </div>

            {/* BARRA DI INPUT: Appare se mostraInput è true */}
            {mostraInput && (
                <div className="join-room-container">
                    <input 
                        type="text" 
                        className="room-input"
                        placeholder="Inserisci il codice stanza" 
                        value={codiceStanza}
                        onChange={(e) => setCodiceStanza(e.target.value)} 
                    />
                    {/* Il tasto ora lancia la funzione gestisciEntra! */}
                    <button className="entra-btn" onClick={gestisciEntra}>
                        Entra
                    </button>
                </div>
            )}
        </div>
    );
}

export default MixerActions;