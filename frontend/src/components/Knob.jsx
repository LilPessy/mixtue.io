import './Knob.css'

// 1. Aggiungiamo 'value' ai props e togliamo l'import di useState
function Knob({ freq, value, onChange }) {

    const handleChange = (e) => {
        // 2. Convertiamo in numero per evitare brutti scherzi con Tone.js
        const newValue = Number(e.target.value);
        
        // 3. Passiamo SOLO il valore al genitore. 
        // L'ID non ci serve più qui, perché MixerRoom lo sa già!
        onChange(newValue);
    };

    // 4. Calcoliamo la rotazione basandoci sul 'value' in tempo reale che ci passa MixerRoom
    const percentage = (value - (-40)) / (12 - (-40));
    const rotationDegrees = (percentage * 270) - 135; 

    return (
        <div className="knobContainer">
            <span className="label">{freq}</span>
            <div className="knobVisual" style={{ transform: `rotate(${rotationDegrees}deg)` }}>
                <div 
                    className="knobIndicator" 
                    style={{ background: freq === "HF" ? '#87EAFE' : freq === "MF" ? '#7B8CE1' : "#201971" }}
                ></div>
            </div>

            <input 
                id={freq === "HF" ? 0 : freq === "MF" ? 1 : 2} // Puoi tenerlo per il CSS se ti serve
                type="range" 
                min={-40} 
                max={12} 
                step="1" 
                value={value} // 5. Usiamo il valore che arriva dal genitore
                onChange={handleChange}
                className="hiddenInput"
            />
        </div>
    )
}

export default Knob;