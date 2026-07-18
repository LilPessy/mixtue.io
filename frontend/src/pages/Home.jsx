import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MixerActions from '../components/MixerAction';
import InsiemeCards from '../components/InsiemeCards';
import InsiemeCollaborazioni from '../components/InsiemeCollaborazioni';

function Home() {
    const [datiUtente, setDatiUtente] = useState(null);
    const navigate = useNavigate(); 

    const nomeFormattato = datiUtente?.nome 
        ? datiUtente.nome.charAt(0).toUpperCase() + datiUtente.nome.slice(1).toLowerCase()
        : '';

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    setDatiUtente({
                        ...data,
                        iTuoiProgetti: data.iTuoiProgetti || [],
                        collaborazioni: data.collaborazioni || []
                    });
                } else {
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                }
            } catch (errore) {
                console.error("Errore di rete:", errore);
            }
        };

        fetchUserData();
    }, [navigate]);

    const gestisciEliminazione = async (idProgetto) => {
        const conferma = window.confirm("Sei sicuro di voler rimuovere questo progetto dalla tua bacheca?");
        if (!conferma) return;

        try {
            const response = await fetch(`http://localhost:3000/api/sessions/elimina/${idProgetto}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: datiUtente.username }) 
            });

            if (response.ok) {
                setDatiUtente(prev => ({
                    ...prev,
                    iTuoiProgetti: prev.iTuoiProgetti.filter(p => p.id !== idProgetto && p._id !== idProgetto),
                    collaborazioni: prev.collaborazioni.filter(p => p.id !== idProgetto && p._id !== idProgetto)
                }));
            } else {
                window.alert("Si è verificato un problema durante l'eliminazione.");
            }
        } catch (errore) {
            console.error("Errore di rete durante l'eliminazione:", errore);
        }
    };

    return (
        <section>
            <Navbar username={nomeFormattato || datiUtente?.username} propic={datiUtente?.propic} />
            <MixerActions username={datiUtente?.username || null} />
            
            <div className="sezione-miei-progetti">
                <h2>I tuoi progetti {datiUtente?.username}</h2>
                {datiUtente ? (
                    <InsiemeCards 
                        progetti={datiUtente.iTuoiProgetti} 
                        onDelete={gestisciEliminazione} 
                    />
                ) : (
                    <p>Caricamento dei progetti in corso...</p>
                )}

                <h2>{nomeFormattato || datiUtente?.username}, continua a collaborare con: </h2>
                {datiUtente ? (
                    <InsiemeCollaborazioni 
                        progetti={datiUtente.collaborazioni} 
                        onDelete={gestisciEliminazione} 
                    />
                ) : (
                    <p>Caricamento delle collaborazioni in corso...</p>
                )}
            </div>

            <footer className="footer-container">
                <p>&copy; {new Date().getFullYear()} MixTuEIo. Tutti i diritti riservati.</p>
                <p className="footer-credits">Sviluppato con ☕, 💻 e tanti sani scleri (nessun santo è stato chiamato dal calendario ancora)</p>
            </footer>
        </section>
    );
}

export default Home;