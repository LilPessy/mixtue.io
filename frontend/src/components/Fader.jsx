import './Fader.css'

// 1. Aggiungiamo 'value' tra i props
function Fader({ value, onChange }) {

    const handleChange = (e) => {
        // 2. Convertiamo il valore in numero (gli input range restituiscono sempre stringhe)
        // Questo evita bug matematici in Tone.js!
        const numericValue = Number(e.target.value);
        
        // 3. Avvisiamo MixerRoom del nuovo valore
        onChange(numericValue);
    };

    return (
        <div className="faderContainer">
            <label className="label">Volume</label>
            <input 
                type="range" 
                min={-60} 
                max={10} 
                step="1" 
                // 4. Usiamo il valore dettato dal genitore
                value={value} 
                onChange={handleChange}
                className="slider"
            />
        </div>
    );
}

export default Fader