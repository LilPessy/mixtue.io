import { useState, useRef, useEffect } from 'react'
import './MixerRoom.css'
import * as Tone from 'tone'
import nextIcon from '../assets/next.png'
import Button from '../components/Button'
import Knob from '../components/Knob'
import Fader from '../components/Fader'
import Dot from '../components/Dot'
import FreqDisplay from '../components/FreqDisplay'
import ExitIcon from '../assets/exit.png'
import PlayIcon from '../assets/play.png'

function MixerRoom(){

    const tracks = [
        {
            id:0,
            url: 'public/tracks/bass.mp3',
            name: "bass.mp3"
        },
        {
            id:1,
            url: 'public/tracks/dueEstranei.mp3',
            name: "dueEstranei.mp3"
        },
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

   // Contenitori per TUTTE le tracce, indicizzati per ID
    const playersRef = useRef({});
    const offsetsRef = useRef({});
    const startTimesRef = useRef({});

    // Stato per tracciare chi sta suonando 
    const [playingStates, setPlayingStates] = useState({});
    const [isReady, setIsReady] = useState(false);

    // 1. Calcoliamo l'ID della traccia attualmente a schermo
    const currentTrackId = tracks[trackCounter].id;
    
    // 2. Peschiamo il player specifico per quella traccia dal nostro raccoglitore
    const currentAudioSource = playersRef.current[currentTrackId];

    

    useEffect(() => {
    // Cicliamo l'array e creiamo un player per ogni traccia
        tracks.forEach((track) => {
            const player = new Tone.Player({
                // Assicurati che l'URL punti a Express come dicevamo prima!
                url: `http://localhost:5173/${track.url}`, 
                onload: () => {
                    setIsReady(true);
                }
            }).toDestination(); 

            // Salviamo ogni player e inizializziamo i suoi contatori usando l'ID (0, 1, 2...)
            playersRef.current[track.id] = player;
            offsetsRef.current[track.id] = 0;
            startTimesRef.current[track.id] = 0;
        });

        return () => {
            // Pulizia: distruggiamo tutti i player in un colpo solo
            Object.values(playersRef.current).forEach(p => p.dispose());
        }
    }, []); // Array vuoto: lo fa una volta sola all'avvio

    const handlePlay = async () => {
        await Tone.start(); 
        
        // Capiamo quale traccia è attualmente a schermo nel carosello
        const currentTrackId = tracks[trackCounter].id;
        const player = playersRef.current[currentTrackId];
        const isCurrentlyPlaying = playingStates[currentTrackId];

        if (player && isReady) {
            if (isCurrentlyPlaying) {
                // 1. METTIAMO IN PAUSA LA TRACCIA A SCHERMO
                const tempoTrascorso = Tone.now() - startTimesRef.current[currentTrackId];
                offsetsRef.current[currentTrackId] += tempoTrascorso;
                
                player.stop();
                
                // Aggiorniamo lo stato dicendo che QUESTA traccia è in pausa
                setPlayingStates(prev => ({ ...prev, [currentTrackId]: false }));

            } else {
                // 2. FACCIAMO RIPARTIRE LA TRACCIA A SCHERMO
                startTimesRef.current[currentTrackId] = Tone.now();
                
                player.start(Tone.now(), offsetsRef.current[currentTrackId]);
                
                setPlayingStates(prev => ({ ...prev, [currentTrackId]: true }));
            }
        }
    }


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

            <FreqDisplay audioSource={currentAudioSource}/>


            <div className='faderContainer'>
                <Fader onChange={setVolume}/>
            </div>

            <div className='buttonContainer'>
                <div className='buttonWrap'>
                    <Button text="Mute"/>
                </div>
                <div className='buttonWrap'>
                    <Button icon={PlayIcon} callback={handlePlay}/>
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