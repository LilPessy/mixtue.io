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
import playIcon from '../assets/play.png'
import pauseIcon from '../assets/pause.png'

function MixerRoom(){

    const [tracks, setTracks] = useState( [
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
    ]);

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

    const [knobsValues, setKnobsValues] = useState({
        0: [0, 0, 0], 
        1: [0, 0, 0]
    });
    
    // Stessa cosa per il volume
    const [volumes, setVolumes] = useState({
        0: 0,
        1: 0
    });
    const [isMute, setIsMute] = useState(new Array(tracks.length).fill(false));
    let prevVol=0

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
    // Player per ogni traccia
        tracks.forEach((track) => {
            const player = new Tone.Player({
                url: `http://localhost:3000/${track.url}`, 
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
    }, [tracks]); //solo all'avvio

    useEffect(() => {
        if (!tracks[trackCounter]) return;
        
        const currentTrackId = tracks[trackCounter].id;
        const currentEq = eqsRef.current[currentTrackId];
        const currentVol = volumesRef.current[currentTrackId];

        // Peschiamo i valori specifici di questa traccia
        const currentKnobs = knobsValues[currentTrackId] || [0, 0, 0];
        const currentVolume = volumes[currentTrackId] || 0;

        if (currentEq) {
            currentEq.high.value = currentKnobs[0]; 
            currentEq.mid.value  = currentKnobs[1];  
            currentEq.low.value  = currentKnobs[2];  
        }

        if (currentVol) {
            currentVol.volume.value = currentVolume;
        }

    }, [knobsValues, volumes, trackCounter, tracks]);//si aggiorna inisme agli useState



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


    const handleFreqChange = (freqId, value) => {
        const currentTrackId = tracks[trackCounter]?.id;
        if (currentTrackId === undefined) return;

        setKnobsValues(prev => {
            // Peschiamo l'array della traccia attuale, o un array di default [0,0,0]
            const trackKnobs = prev[currentTrackId] ? [...prev[currentTrackId]] : [0, 0, 0];
            trackKnobs[freqId] = value; // 0=HF, 1=MF, 2=LF
            
            // Restituiamo tutto l'oggetto aggiornato
            return { ...prev, [currentTrackId]: trackKnobs };
        });
    };

    const handleVolumeChange = (value) => {
        const currentTrackId = tracks[trackCounter]?.id;
        if (currentTrackId === undefined) return;

        setVolumes(prev => ({ ...prev, [currentTrackId]: value }));
    };

    const handleMute = ()=>{
        const tempMute = [...isMute];
        tempMute[currentTrackId] = !tempMute[currentTrackId];
        setIsMute(tempMute);

        const currentVol = volumesRef.current[currentTrackId];
        if (currentVol) {
            currentVol.mute = tempMute[currentTrackId];
        }
    }


    const handelClick = ()=>{
        window.location.href = "http://localhost:5173/"
    }

    const copyOnClick = (e)=>{
        const code = e.target.innerHTML;
        navigator.clipboard.writeText(code);
        alert("Codice stanza copiato!")
    }

    const fileInputRef = useRef(null);
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };
    const handleTrackUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("audioFile", file);

        try {
            const response = await fetch("http://localhost:3000/api/upload/track", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                
                // Creiamo il nuovo oggetto traccia usando il nome file restituito da Multer
                const newTrack = {
                    id: tracks.length,
                    url: 'public/tracks/'+data.fileName,
                    name: data.fileName 
                };
                
                // Aggiorniamo lo stato delle tracce (il carosello si allungherà in automatico)
                setTracks([...tracks, newTrack]);
                setIsMute(prev => [...prev, false]); 
                
                // AGGIUNGI QUESTE DUE RIGHE:
                setKnobsValues(prev => ({ ...prev, [newTrack.id]: [0, 0, 0] }));
                setVolumes(prev => ({ ...prev, [newTrack.id]: 0 }));
                
                // Un feedback per capire che è andato tutto a buon fine
                console.log("Traccia caricata con successo:", data.fileName);
                
                // Opzionale: resettiamo l'input nel caso volessi ricaricare lo stesso file
                event.target.value = null; 
            } else {
                console.error("Errore dal server durante il caricamento");
            }
        } catch (error) {
            console.error("Errore di comunicazione col backend:", error);
        }
    };

    const currentKnobs = knobsValues[currentTrackId] || [0, 0, 0];
    const currentVolume = volumes[currentTrackId] || 0;

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
                <Knob freq="HF" value={currentKnobs[0]} onChange={(val) => handleFreqChange(0, val)}/>
                <Knob freq="MF" value={currentKnobs[1]} onChange={(val) => handleFreqChange(0, val)}/>
                <Knob freq="LF" value={currentKnobs[2]} onChange={(val) => handleFreqChange(0, val)}/>
            </div>

            <FreqDisplay audioSource={currentAudioSource}/>


            <div className='faderContainer'>
                <Fader value={currentVolume} onChange={handleVolumeChange}/>
            </div>

            <div className='buttonContainer'>
                <div className='buttonWrap'>
                    <Button text={isMute[currentTrackId] ? "Unmute" : "Mute"} callback={handleMute}/>
                </div>
                <div className='buttonWrap'>
                    <Button icon={playingStates[currentTrackId] ? pauseIcon : playIcon} callback={handlePlay}/>
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
                <input 
                    type="file" 
                    accept="audio/mp3, audio/wav, audio/mpeg" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleTrackUpload}
                />
                <Button text="Aggiungi Traccia" callback={triggerFileInput}/>
            </div>
            

        </section>
    )
}

export default MixerRoom