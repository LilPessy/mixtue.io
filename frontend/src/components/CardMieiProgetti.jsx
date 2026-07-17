import React from 'react';
// 1. IMPORTIAMO L'IMMAGINE DALLA CARTELLA ASSETS
import sfondoMixer from '../assets/myprogetti.png'; 
import './CardMieiProgetti.css'; 

function CardMieiProgetti({ nomeProgetto, autore }) {
    return (
        <div className="card-miei-progetti">
            
            {/* 2. INSERIAMO L'IMMAGINE */}
            <div className="card-immagine-container">
                <img 
                    src={sfondoMixer} 
                    alt="Sfondo del progetto" 
                    className="card-immagine"
                />
            </div>

            {/* 3. IL TESTO IN BASSO (La parte viola su Figma) */}
            <div className="card-testo-container">
                <h3 className="card-nome-progetto">{nomeProgetto}</h3>
                {autore && <p className="card-autore">di {autore}</p>}
            </div>
            
        </div>
    );
}

export default CardMieiProgetti;