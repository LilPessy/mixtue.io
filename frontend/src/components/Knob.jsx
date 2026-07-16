import { useState } from "react"
import './Knob.css'

function Knob({freq, onChange}){
    const [value, setValue] = useState(0)

    const handleChange =  (e)=>{
        setValue(e.target.value)
        onChange(e.target, value)
    }

    const percentage = (value - (-40)) / (12 - (-40));
    const rotationDegrees = (percentage * 270) - 135; 

    return (
        <div className="knobContainer">
            <span className="label">{freq}</span>
            <div className="knobVisual" style={{ transform: `rotate(${rotationDegrees}deg)` }}>
                <div className="knobIndicator" style={{background: freq === "HF" ? '#87EAFE' : freq === "MF" ? '#7B8CE1' : "#201971"}}></div>
            </div>

            <input 
                type="range" 
                min={-40} 
                max={12} 
                step="0.1" 
                value={value} 
                onChange={handleChange}
                className="hiddenInput"
            />
        </div>
    )
}

export default Knob