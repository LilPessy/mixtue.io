import React from 'react';
import sfondoMixer from '../assets/myprogetti.png'; 
import './CardMieiProgetti.css'; // Puoi lasciare questo CSS o rinominare anche lui


// Aggiungiamo 'autore' come prop opzionale
function CardProgetto({ nomeProgetto, autore }) {
    return (
        <div className="card-miei-progetti">
            
            <div className="card-immagine-container">
                <img 
                    src={sfondoMixer} 
                    alt="Sfondo del progetto" 
                    className="card-immagine"
                />
            </div>

            <div className="card-testo-container">
                <h3 className="card-nome-progetto">{nomeProgetto}</h3>

                {/* Se 'autore' esiste, stampa la riga. Altrimenti non stampa nulla! */}
                {autore && (
                    <p className="card-autore">di {autore}</p>
                )}
            </div>
            
        </div>
    );
}

export default CardProgetto;