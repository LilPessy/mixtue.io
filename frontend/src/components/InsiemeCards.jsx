import React from 'react';
import CardProgetto from './CardProgetto'; 

function InsiemeCards({ progetti }) {
    if (!progetti || progetti.length === 0) return <p>Nessun progetto.</p>;

    return (
        <div className="cards-scroll-container">
            {progetti.map((progetto) => (
                <CardProgetto 
                    key={progetto.id}           
                    id={progetto.id}             
                    nomeProgetto={progetto.nome} 
                />
            ))}
        </div>
    );
}

export default InsiemeCards;