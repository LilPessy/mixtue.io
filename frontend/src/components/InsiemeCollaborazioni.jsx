import React from 'react';
import CardProgetto from './CardProgetto'; 

function InsiemeCollaborazioni({ progetti }) {
    if (!progetti || progetti.length === 0) return <p>Nessuna collaborazione.</p>;

    return (
        <div className="cards-scroll-container">
            {progetti.map((progetto) => (
                <CardProgetto 
                    key={progetto.id}           
                    id={progetto.id}             
                    nomeProgetto={progetto.nome} 
                    proprietario={progetto.proprietario} 
                />
            ))}
        </div>
    );
}

export default InsiemeCollaborazioni;