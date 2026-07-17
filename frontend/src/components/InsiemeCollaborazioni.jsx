import React from 'react';
import CardProgetto from './CardProgetto'; // Importiamo la STESSA card universale

function InsiemeCollaborazioni({ progetti }) {
    if (!progetti || progetti.length === 0) return <p>Nessuna collaborazione.</p>;

    return (
        <div className="cards-scroll-container">
            {progetti.map((progetto) => (
                <CardProgetto 
                    key={progetto.id}           
                    nomeProgetto={progetto.nome} 
                    proprietario={progetto.proprietario} // Passiamo il dato extra per attivare la scritta!
                />
            ))}
        </div>
    );
}

export default InsiemeCollaborazioni;