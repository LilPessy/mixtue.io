import React from 'react';
import './InsiemeCards.css';
import CardProgetto from './CardProgetto'; // Importiamo la card universale

function InsiemeCards({ progetti }) {
    if (!progetti || progetti.length === 0) return <p>Nessun progetto.</p>;

    return (
        <div className="cards-scroll-container">
            {progetti.map((progetto) => (
                <CardProgetto 
                    key={progetto.id}           
                    nomeProgetto={progetto.nome} 
                    autore={progetto.autore}
                />
            ))}
        </div>
    );
}

export default InsiemeCards;