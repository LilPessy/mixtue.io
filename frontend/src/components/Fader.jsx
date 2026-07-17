import { useState } from "react";
import './Fader.css'

function Fader({onChange}){
    const [value, setValue] = useState(0);

    const handleChange = (e) => {
        setValue(e.target.value);
        onChange(e.target.value);
    };

    return (
        <div className="faderContainer">
            <label className="label">Volume</label>
            <input 
                type="range" 
                min={-60} 
                max={10} 
                step="1" 
                value={value} 
                onChange={handleChange}
                className="slider"
            />
        </div>
    );
}

export default Fader