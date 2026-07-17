import React from 'react';
import { useNavigate } from 'react-router-dom';
import sfondoMixer from '../assets/myprogetti.png'; 
import './CardMieiProgetti.css'; 

function CardProgetto({ id, nomeProgetto, proprietario }) {
    const navigate = useNavigate();

    const apriProgetto = () => {
        if (id) {
            navigate(`/mixer/${id}`);
        }
    };

    return (
        <div className="card-miei-progetti" onClick={apriProgetto} style={{ cursor: 'pointer' }}>
            
            <div className="card-immagine-container">
                <img 
                    src={sfondoMixer} 
                    alt={`Sfondo del progetto ${nomeProgetto}`} 
                    className="card-immagine"
                />
            </div>

            <div className="card-testo-container">
                <h3 className="card-nome-progetto">{nomeProgetto}</h3>
                
                {proprietario && (
                    <p className="card-proprietario-testo">di {proprietario}</p>
                )}
            </div>
            
        </div>
    );
}

export default CardProgetto;