import React, { useState } from 'react';
import './MixerAction.css';
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
                    <span className="icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 4V8" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M3 10H9" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M6 12V20" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                            
                            <path d="M12 4V13" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M9 15H15" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M12 17V20" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                            
                            <path d="M18 4V6" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M15 8H21" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M18 10V20" stroke="#8292ED" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </span>
                    Nuovo Mixer
                </button>

                <button className="action-btn">
                    <span className="icon">
                        <svg width="40" height="40" viewBox="0 1 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6.5" cy="5.5" r="3.2" fill="#8292ED" />
                            <path d="M2.5 13.5 C 2.5 11.5 4.3 9.5 6.5 9.5 C 8.7 9.5 10.5 11.5 10.5 13.5 C 10.5 14.3 9.8 15 9 15 H 4 C 3.2 15 2.5 14.3 2.5 13.5 Z" fill="#8292ED" />
                            
                            <circle cx="17.5" cy="14.5" r="3.2" fill="#8292ED" />
                            <path d="M13.5 22.5 C 13.5 20.5 15.3 18.5 17.5 18.5 C 19.7 18.5 21.5 20.5 21.5 22.5 C 21.5 23.3 20.8 24 20 24 H 15 C 14.2 24 13.5 23.3 13.5 22.5 Z" fill="#8292ED" />
                            
                            <path d="M12.5 5.5 H 16.5 C 19.2614 5.5 21.5 7.73858 21.5 10.5 V 11" stroke="#8292ED" strokeWidth="3" strokeLinecap="round" fill="none" />
                            
                            <path d="M11.5 22.5 H 7.5 C 4.73858 22.5 2.5 20.2614 2.5 17.5 V 17" stroke="#8292ED" strokeWidth="3" strokeLinecap="round" fill="none" />
                        </svg>
                    </span>
                    Collabora
                </button>
            </div>

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
        </div>
    );
}

export default MixerActions;