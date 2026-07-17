import React from 'react';
import './InsiemeCards.css';
// Importiamo lo stampino che hai appena creato!
import CardMieiProgetti from './CardMieiProgetti';

function InsiemeCards({ progetti }) {
    
    // 1. Controllo di sicurezza iniziale
    // Se l'array non esiste ancora (es. sta ancora caricando dal server) o è vuoto, mostriamo un messaggio amichevole.
    if (!progetti || progetti.length === 0) {
        return <p className="nessun-progetto">Non hai ancora creato nessun progetto. Inizia un nuovo mixer!</p>;
    }

    // 2. Il rendering delle card
    return (
        <div className="cards-scroll-container">
            {/* .map() prende ogni oggetto 'progetto' dall'array e crea una card */}
            {progetti.map((progetto) => (
                <CardMieiProgetti 
                    key={progetto.id}           // OBBLIGATORIO: React ha bisogno di una chiave unica per ogni elemento della lista
                    nomeProgetto={progetto.nome} // Passiamo il nome del progetto alla card
                    autore={progetto.autore}
                />
            ))}
        </div>
    );
}

export default InsiemeCards;