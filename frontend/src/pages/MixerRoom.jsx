import { useState } from 'react'
import './MixerRoom.css'
import nextIcon from '../assets/next.png'
import Button from '../components/Button'
import Knob from '../components/Knob'
import Fader from '../components/Fader'
import Dot from '../components/Dot'
import ExitIcon from '../assets/exit.png'
import PlayIcon from '../assets/play.png'

function MixerRoom(){

    const tracks = [
        {
            id:0,
            name: "bass.mp3"
        },
        {
            id:1,
            name: "drums.mp3"
        },
        {
            id:2,
            name: "guitar.mp3"
        },
        {
            id:3,
            name: "piano.mp3"
        }
    ];

    const prevTrack = ()=>{
        if(trackCounter>0){
            setTrackCounter(trackCounter-1)
        }
    }

    const nextTrack = ()=>{
        if(trackCounter<tracks.length-1){
            setTrackCounter(trackCounter+1)
        }
    }

    const [trackCounter, setTrackCounter] = useState(0);

    const [knobsValue, setKnobsValue] = useState([0,0,0])
    const [volume, setVolume] = useState(0)

    const setFreqValue = (id, value)=>{
       const temp = [...knobsValue];
       temp[id] = value
       setKnobsValue(temp)
    }


    const handelClick = ()=>{
        window.location.href = "http://localhost:5173/"
    }

    const copyOnClick = (e)=>{
        const code = e.target.innerHTML;
        navigator.clipboard.writeText(code);
        alert("Codice stanza copiato!")
    }

    return(
        <section>
            <div className='header-curvo'></div>
            <div className='header'>
                <div className='title'>
                    <h1>
                        Amore amaro
                    </h1>
                    <p>codice stanza: <span onClick={copyOnClick}>69420</span></p>
                </div>
                <div className='btnWrap'>
                    <Button icon={ExitIcon} callback={handelClick}/>
                </div>
            </div>

            <div className='knobsContainer'>
                <Knob freq="HF" onChange={setFreqValue}/>
                <Knob freq="MF" onChange={setFreqValue}/>
                <Knob freq="LF" onChange={setFreqValue}/>
            </div>


            <div className='faderContainer'>
                <Fader onChange={setVolume}/>
            </div>

            <div className='buttonContainer'>
                <div className='buttonWrap'>
                    <Button text="Mute"/>
                </div>
                <div className='buttonWrap'>
                    <Button icon={PlayIcon} />
                </div>
                
            </div>
            
            <div className="carouselContainer">
                <h3>{tracks[trackCounter].name}</h3>
                <div className='buttonContainer'>
                    <img onClick={prevTrack} src={nextIcon} className="prevTrack"/>
                        {tracks.map(t=> <Dot key={t.id} id={t.id} track={trackCounter}/>)}
                    <img onClick={nextTrack} src={nextIcon} className="nextTrack"/>
                </div>
            </div>
            <div className='trackButtonWrap'>
                <Button text="Aggiungi Traccia"/>
            </div>
            

        </section>
    )
}

export default MixerRoom