import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MixerActions from '../components/MixerAction';
import InsiemeCards from '../components/InsiemeCards';
import InsiemeCollaborazioni from '../components/InsiemeCollaborazioni';

function Home() {
    // SE MANCA QUESTA RIGA, REACT CRASHA!
    const [datiUtente, setDatiUtente] = useState(null);
    const navigate = useNavigate(); 

    // Variabile ultra-sicura per il nome formattato
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

    return (
        <section>
            {/* Passiamo nomeFormattato se esiste, altrimenti l'username */}
            <Navbar username={nomeFormattato || datiUtente?.username} propic={datiUtente?.propic} />
            <MixerActions username={datiUtente?.username || null} />
            
            <div className="sezione-miei-progetti">
                <h2>I tuoi progetti {datiUtente?.username}</h2>
                {datiUtente ? (
                    <InsiemeCards progetti={datiUtente.iTuoiProgetti} />
                ) : (
                    <p>Caricamento dei progetti in corso...</p>
                )}

                <h2>{nomeFormattato || datiUtente?.username}, continua a collaborare con: </h2>
                {datiUtente ? (
                    <InsiemeCollaborazioni progetti={datiUtente.collaborazioni} />
                ) : (
                    <p>Caricamento delle collaborazioni in corso...</p>
                )}
            </div>
        </section>
    );
}

export default Home;