import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MixerActions from '../components/MixerAction';

import InsiemeCards from '../components/InsiemeCards';
import InsiemeCollaborazioni from '../components/InsiemeCollaborazioni';

function Home() {
    // 2. CREIAMO LO STATO: Qui salveremo i dati del Magnifico Rettore appena arrivano
    const [datiUtente, setDatiUtente] = useState(null);

    // 3. LA CHIAMATA AL BACKEND (Fetch)
    // useEffect con [] alla fine fa in modo che questa richiesta parta SOLO UNA VOLTA quando apri la pagina
    useEffect(() => {
        fetch('http://localhost:3000/api/user/test')
            .then(response => response.json())
            .then(data => {
                console.log("Dati arrivati dal server:", data); // Così puoi vederli nella console (F12)
                setDatiUtente(data); // Salviamo i dati nello stato!
            })
            .catch(errore => {
                console.error("Errore durante il recupero dei progetti:", errore);
            });
    }, []);

    return (
        <section>
            <Navbar />
            <MixerActions />
            
            <div className="sezione-miei-progetti">
                <h2>I tuoi progetti</h2>
                
                {/* 4. RENDERING CONDIZIONALE E PASSAGGIO PROPS */}
                {/* Se i dati sono arrivati (datiUtente non è null), stampa InsiemeCards passandogli l'array! */}
                {datiUtente ? (
                    <InsiemeCards progetti={datiUtente.iTuoiProgetti} />
                ) : (
                    <p>Caricamento dei progetti del Magnifico Rettore in corso...</p>
                )}

                <h2>Collaborazioni</h2>
                {datiUtente ? (
                    <InsiemeCollaborazioni progetti={datiUtente.collaborazioni} />
                ) : (
                    <p>Caricamento delle collaborazioni in corso...</p>
                )}
            </div>

            <div className="sezione-miei-progetti" style={{ marginBottom: '80px', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h2 style={{ textAlign: 'left', alignSelf: 'flex-start', margin: '0 0 16px 0' }}>Continua a Collaborare</h2>
                
                {datiUtente ? (
                    <InsiemeCards progetti={datiUtente.continuaACollaborare} />
                ) : (
                    <p style={{ textAlign: 'left', alignSelf: 'flex-start', margin: 0 }}>Caricamento dei progetti condivisi...</p>
                )}
            </div>
        </section>
    );
}

export default Home;