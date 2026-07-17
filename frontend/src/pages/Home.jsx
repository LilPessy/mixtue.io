import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MixerActions from '../components/MixerAction';
import InsiemeCards from '../components/InsiemeCards';
import InsiemeCollaborazioni from '../components/InsiemeCollaborazioni';

function Home() {
    const [datiUtente, setDatiUtente] = useState(null);
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('accessToken');
            
            // Se non c'è token, rimandiamo subito al login senza fare chiamate
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Chiamiamo la rotta protetta
                const response = await fetch('http://localhost:3000/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Dati autenticati arrivati dal server:", data);
                    
                    // Salvataggio in sicurezza: se gli array non esistono, mettiamo array vuoti
                    setDatiUtente({
                        ...data,
                        iTuoiProgetti: data.iTuoiProgetti || [],
                        collaborazioni: data.collaborazioni || []
                    });
                } else {
                    console.warn("Sessione scaduta o non valida.");
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                }
            } catch (errore) {
                console.error("Errore di rete durante il recupero dell'utente:", errore);
            }
        };

        fetchUserData();
    }, [navigate]);

    return (
        <section>
            <Navbar username={datiUtente?.nome?.toUpperCase()} propic={datiUtente?.propic}/>
            <MixerActions username={datiUtente?.username || null} />
            
            <div className="sezione-miei-progetti">
                <h2>I tuoi progetti</h2>
                {datiUtente ? (
                    <InsiemeCards progetti={datiUtente.iTuoiProgetti} />
                ) : (
                    <p>Caricamento dei progetti in corso...</p>
                )}

                <h2>{datiUtente?.username?.toUpperCase()}, continua a collaborare con: </h2>
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