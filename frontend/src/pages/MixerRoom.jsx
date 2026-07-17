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

    const playersRef = useRef({});
    const offsetsRef = useRef({});
    const startTimesRef = useRef({});

    const [playingStates, setPlayingStates] = useState({});
    const [isReady, setIsReady] = useState(false);
    const currentTrackId = tracks[trackCounter].id;
    const currentAudioSource = playersRef.current[currentTrackId];

    const eqsRef = useRef({});
    const volumesRef = useRef({});
    

    useEffect(() => {
    // Cicliamo l'array e creiamo un player per ogni traccia
        tracks.forEach((track) => {
            const player = new Tone.Player({
                url: `http://localhost:5173/${track.url}`, 
                onload: () => {
                    setIsReady(true);
                }
            })
            const eq = new Tone.EQ3(0, 0, 0); 
            const vol = new Tone.Volume(0);   

            // Creiamo la catena: Player -> EQ -> Volume -> Casse
            player.chain(eq, vol, Tone.Destination);

            // Salviamo tutto nei nostri raccoglitori
            playersRef.current[track.id] = player;
            eqsRef.current[track.id] = eq;
            volumesRef.current[track.id] = vol;
            
            offsetsRef.current[track.id] = 0;
            startTimesRef.current[track.id] = 0;

        });

        return () => {
            Object.values(playersRef.current).forEach(p => p.dispose());
        }
    }, []); //solo all'avvio

    useEffect(() => {
        //traccia attiva nel carosello
        const currentTrackId = tracks[trackCounter].id;
        
        const currentEq = eqsRef.current[currentTrackId];
        const currentVol = volumesRef.current[currentTrackId];

        
        if (currentEq) {
            currentEq.high.value = knobsValue[0]; 
            currentEq.mid.value  = knobsValue[1];  
            currentEq.low.value  = knobsValue[2];  
        }

        if (currentVol) {
            currentVol.volume.value = volume;
        }

    }, [knobsValue, volume, trackCounter]); //si aggiorna inisme agli useState



    const handlePlay = async () => {
        await Tone.start(); 
        
        // traccia nel carosello
        const currentTrackId = tracks[trackCounter].id;
        const player = playersRef.current[currentTrackId];
        const isCurrentlyPlaying = playingStates[currentTrackId];

        if (player && isReady) {
            if (isCurrentlyPlaying) {
                
                const tempoTrascorso = Tone.now() - startTimesRef.current[currentTrackId];
                offsetsRef.current[currentTrackId] += tempoTrascorso;
                
                player.stop();
                
                //pausa
                setPlayingStates(prev => ({ ...prev, [currentTrackId]: false }));

            } else {
                //play
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