import React from 'react';
import './Footeramazing.css';

function Footeramazing() {
    // Calcola l'anno in automatico (es. 2026)
    const annoCorrente = new Date().getFullYear();

    return (
        <footer className="footer-container">
            <p>&copy; {annoCorrente} MixTuEIo. Tutti i diritti riservati.</p>
            <p className="footer-credits">Sviluppato con ☕, 💻 e tanti sani scleri (nessun santo è stato chiamato dal calendario ancora)</p>
        </footer>
    );
}

export default Footeramazing; // <-- Corretto!