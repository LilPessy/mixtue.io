import React, { useState } from 'react';

function MixerActions() {
    // 1. GLI STATI
    // Questo stato decide se la barra di input è visibile (true) o nascosta (false). Di base è nascosta.
    const [mostraInput, setMostraInput] = useState(false);
    
    // Questo stato memorizza il codice che l'utente sta digitando.
    const [codiceStanza, setCodiceStanza] = useState('');

    // 2. I GESTORI DEGLI EVENTI
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
                <button className="action-btn">
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