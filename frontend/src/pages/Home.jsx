import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MixerActions from '../components/MixerAction';
import InsiemeCards from '../components/InsiemeCards';
import InsiemeCollaborazioni from '../components/InsiemeCollaborazioni';
import './Home.css';

function Home() {
    const [datiUtente, setDatiUtente] = useState(null);
    const navigate = useNavigate(); 
    
    // 1. ECCO LA VARIABILE MAGICA
    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
                // 2. AGGIORNATA LA FETCH DEL PROFILO
                const response = await fetch(`${backendURL}/api/auth/me`, {
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
    }, [navigate, backendURL]); // Aggiunto backendURL alle dipendenze per sicurezza

    const gestisciEliminazione = async (idProgetto) => {
        const conferma = window.confirm("Sei sicuro di voler rimuovere questo progetto dalla tua bacheca?");
        if (!conferma) return;

        try {
            // 3. AGGIORNATA LA FETCH DI ELIMINAZIONE
            const response = await fetch(`${backendURL}/api/sessions/elimina/${idProgetto}`, {
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