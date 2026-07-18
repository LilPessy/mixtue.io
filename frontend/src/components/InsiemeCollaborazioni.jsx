import React from 'react';
import CardProgetto from './CardProgetto'; 

// AGGIUNTO onDelete QUI!
function InsiemeCollaborazioni({ progetti, onDelete }) {
    if (!progetti || progetti.length === 0) return <p>Nessuna collaborazione.</p>;

    return (
        <div className="cards-scroll-container">
            {progetti.map((progetto) => (
                <CardProgetto 
                    key={progetto.id || progetto._id}           
                    id={progetto.id || progetto._id}             
                    nomeProgetto={progetto.nome} 
                    proprietario={progetto.proprietario} 
                    onDelete={onDelete} // <--- PASSATO ALLA CARD!
                />
            ))}
        </div>
    );
}

export default InsiemeCollaborazioni;