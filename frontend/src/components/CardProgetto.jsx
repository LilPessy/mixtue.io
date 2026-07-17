import React from 'react';
import sfondoMixer from '../assets/myprogetti.png'; 
import './CardMieiProgetti.css'; // Puoi lasciare questo CSS o rinominare anche lui

// Aggiungiamo 'proprietario' come prop opzionale
function CardProgetto({ nomeProgetto, proprietario }) {
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
                
                {/* IL CONTROLLO CONDIZIONALE DI DANIELE */}
                {/* Se 'proprietario' esiste (cioè se glielo passiamo), stampa la riga. Altrimenti non stampa nulla! */}
                {proprietario && (
                    <p className="card-proprietario-testo">di {proprietario}</p>
                )}
            </div>
            
        </div>
    );
}

export default CardProgetto;