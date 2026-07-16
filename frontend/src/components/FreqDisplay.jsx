import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import './FreqDisplay.css'; // Usa i CSS modules

export default function FreqDisplay({ audioSource }) {
  // 1. Creiamo i riferimenti diretti agli elementi DOM delle 3 barre
  const barLowRef = useRef(null);
  const barMidRef = useRef(null);
  const barHighRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // 2. Inizializziamo l'analizzatore FFT
    // Il numero 32 è la "risoluzione" (più è basso, meno bande analizza, più è leggero)
    const fft = new Tone.FFT(32); 
    
    // Colleghiamo la traccia in riproduzione all'analizzatore
    if (audioSource) {
      audioSource.connect(fft);
    }

    // 3. La funzione che aggiorna la grafica 60 volte al secondo
    const draw = () => {
      // Otteniamo l'array dei decibel delle frequenze (valori da -100 a 0)
      const values = fft.getValue();
      
      // Estrapoliamo 3 valori medi per le nostre 3 barre
      // (Prendiamo dei range specifici dall'array per simulare Low, Mid, High)
      const lowLevel = values[2] + 100;   // Normalizziamo per avere valori positivi
      const midLevel = values[8] + 100;
      const highLevel = values[20] + 100;

      // 4. Modifichiamo il CSS direttamente per un'animazione fluida (senza re-render)
      if (barLowRef.current) barLowRef.current.style.height = `${lowLevel}%`;
      if (barMidRef.current) barMidRef.current.style.height = `${midLevel}%`;
      if (barHighRef.current) barHighRef.current.style.height = `${highLevel}%`;

      // Richiamiamo la funzione al prossimo frame del browser
      animationRef.current = requestAnimationFrame(draw);
    };

    // Facciamo partire il loop di animazione
    draw();

    // 5. Cleanup: fermiamo l'animazione quando l'utente cambia pagina
    return () => {
      cancelAnimationFrame(animationRef.current);
      fft.dispose(); // Puliamo la memoria di Tone.js
    };
  }, [audioSource]);

  return (
    <div className="displayContainer">
      <div ref={barLowRef} className="bar"></div>
      <div ref={barMidRef} className="bar"></div>
      <div ref={barHighRef} className="bar"></div>
    </div>
  );
}