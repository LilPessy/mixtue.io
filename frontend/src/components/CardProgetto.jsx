import React from 'react';
import { useNavigate } from 'react-router-dom';
import sfondoMixer from '../assets/myprogetti.png'; 
import sfondoCollabora from '../assets/collabora.png'; 
import './CardMieiProgetti.css'; 

// AGGIUNTO onDelete TRA LE PROPS!
function CardProgetto({ id, nomeProgetto, proprietario, onDelete }) {
    const navigate = useNavigate();

    const apriProgetto = () => {
        if (id) {
            navigate(`/mixer/${id}`);
        }
    };

    // FUNZIONE PER IL CESTINO (Anticrash e Antibug!)
    const cliccaElimina = (e) => {
        e.stopPropagation(); // FONDAMENTALE! Impedisce di aprire il mixer quando clicchi sul cestino
        if (onDelete) {
            onDelete(id);
        }
    };

    // Determiniamo quale immagine usare
    const immagineSfondo = proprietario ? sfondoCollabora : sfondoMixer;

    return (
        <div className="card-miei-progetti" onClick={apriProgetto} style={{ cursor: 'pointer' }}>
            
            <div className="card-immagine-container">
                <img 
                    src={immagineSfondo} 
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

            {/* IL BOTTONE PER ELIMINARE AGGANCIATO ALLA FUNZIONE */}
            <button className="card-btn-elimina" onClick={cliccaElimina} title="Rimuovi progetto">
                🗑️
            </button>
            
        </div>
    );
}

export default CardProgetto;