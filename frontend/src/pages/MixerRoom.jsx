import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom';
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

function MixerRoom() {

    const { sessionId } = useParams();
    const [roomCode, setRoomCode] = useState('');
    const [roomName, setRoomName] = useState('');
    const [tracks, setTracks] = useState([]);

    // Trasformiamo questi stati da array a oggetti (Mappe) che usano il VERO _id di MongoDB
    const [knobsValues, setKnobsValues] = useState({});
    const [volumes, setVolumes] = useState({});
    const [isMute, setIsMute] = useState({});
    
    const [trackCounter, setTrackCounter] = useState(0);
    const [playingStates, setPlayingStates] = useState({});
    const [isReady, setIsReady] = useState(false);

    const playersRef = useRef({});
    const offsetsRef = useRef({});
    const startTimesRef = useRef({});
    const eqsRef = useRef({});
    const volumesRef = useRef({});

    useEffect(() => {
        const getCodiceStanza = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/session/${sessionId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    const data = await response.json();
                    setRoomCode(data.roomCode);
                    setRoomName(data.name);
                    
                    const fetchedTracks = data.tracks || [];
                    setTracks(fetchedTracks);

                    // Pre-inizializziamo gli stati basandoci sui veri _id dal DB
                    const initKnobs = {};
                    const initVols = {};
                    const initMute = {};
                    
                    fetchedTracks.forEach(t => {
                        // Se la traccia ha uno stato salvato per l'EQ, lo carichiamo, altrimenti [0, 0, 0]
                        if (t.state && t.state.eq) {
                            initKnobs[t._id] = [t.state.eq.high, t.state.eq.mid, t.state.eq.low];
                        } else {
                            initKnobs[t._id] = [0, 0, 0];
                        }

                        // Carichiamo volume e mute salvati (con l'operatore ?? che mette 0/false se i dati mancano)
                        initVols[t._id] = t.state?.volume ?? 0;
                        initMute[t._id] = t.state?.isMuted ?? false;
                    });

                    setKnobsValues(initKnobs);
                    setVolumes(initVols);
                    setIsMute(initMute);
                } else {
                    console.error("Errore: Sessione non trovata");
                }
            } catch (error) {
                console.error("Errore di connessione al server:", error);
            }
        };
        if (sessionId) {
            getCodiceStanza();
        }
    }, [sessionId]);


    useEffect(() => {
        tracks.forEach((track) => {
            // Se il player esiste già, non ricrearlo (evita glitch se aggiungi tracce)
            if (playersRef.current[track._id]) return;

            const player = new Tone.Player({
                // Usiamo fileUrl (struttura DB) e aggiungiamo lo slash iniziale
                url: `http://localhost:3000${track.fileUrl.startsWith('/') ? '' : '/'}${track.fileUrl}`, 
                onload: () => setIsReady(true)
            });
            const eq = new Tone.EQ3(0, 0, 0); 
            const vol = new Tone.Volume(0);   

            player.chain(eq, vol, Tone.Destination);

            // Salviamo tutto usando l'_id come chiave
            playersRef.current[track._id] = player;
            eqsRef.current[track._id] = eq;
            volumesRef.current[track._id] = vol;
            offsetsRef.current[track._id] = 0;
            startTimesRef.current[track._id] = 0;
        });

        // Cleanup
        return () => {
            // Qui andrebbe fatta una pulizia più mirata al component unmount, 
            // ma per ora evitiamo il dispose generale per non spaccare le tracce esistenti
        }
    }, [tracks]); 

    // Aggiornamento EQ e Volumi in tempo reale
    useEffect(() => {
        if (tracks.length === 0 || !tracks[trackCounter]) return;
        
        const currentTrackId = tracks[trackCounter]._id;
        const currentEq = eqsRef.current[currentTrackId];
        const currentVol = volumesRef.current[currentTrackId];

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

    }, [knobsValues, volumes, trackCounter, tracks]);

    const prevTrack = () => {
        if (trackCounter > 0) setTrackCounter(trackCounter - 1);
    }

    const nextTrack = () => {
        if (trackCounter < tracks.length - 1) setTrackCounter(trackCounter + 1);
    }

    const handlePlay = async () => {
        await Tone.start(); 
        
        const currentTrackId = tracks[trackCounter]._id;
        const player = playersRef.current[currentTrackId];
        const isCurrentlyPlaying = playingStates[currentTrackId];

        if (player && isReady) {
            if (isCurrentlyPlaying) {
                const tempoTrascorso = Tone.now() - startTimesRef.current[currentTrackId];
                offsetsRef.current[currentTrackId] += tempoTrascorso;
                player.stop();
                setPlayingStates(prev => ({ ...prev, [currentTrackId]: false }));
            } else {
                startTimesRef.current[currentTrackId] = Tone.now();
                player.start(Tone.now(), offsetsRef.current[currentTrackId]);
                setPlayingStates(prev => ({ ...prev, [currentTrackId]: true }));
            }
        }
    }

    const handleFreqChange = (freqId, value) => {
        const currentTrackId = tracks[trackCounter]?._id;
        if (!currentTrackId) return;

        setKnobsValues(prev => {
            const trackKnobs = prev[currentTrackId] ? [...prev[currentTrackId]] : [0, 0, 0];
            trackKnobs[freqId] = value;
            return { ...prev, [currentTrackId]: trackKnobs };
        });
    };

    const handleVolumeChange = (value) => {
        const currentTrackId = tracks[trackCounter]?._id;
        if (!currentTrackId) return;
        setVolumes(prev => ({ ...prev, [currentTrackId]: value }));
    };

    const handleMute = () => {
        const currentTrackId = tracks[trackCounter]?._id;
        if (!currentTrackId) return;

        setIsMute(prev => {
            const newMuteState = !prev[currentTrackId];
            const currentVol = volumesRef.current[currentTrackId];
            if (currentVol) {
                currentVol.mute = newMuteState;
            }
            return { ...prev, [currentTrackId]: newMuteState };
        });
    }

    

    const copyOnClick = (e) => {
        const code = e.target.innerHTML;
        navigator.clipboard.writeText(code);
        alert("Codice stanza copiato!")
    }

    const fileInputRef = useRef(null);
    const triggerFileInput = () => fileInputRef.current.click();

    const handleTrackUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("audioFile", file);
        formData.append("sessionId", sessionId);

        try {
            const response = await fetch("http://localhost:3000/api/upload/track", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                
                // La rotta backend ora ti restituisce l'oggetto traccia intero
                const newTrack = data.track; 
                
                setTracks(prev => [...prev, newTrack]);
                
                setKnobsValues(prev => ({ ...prev, [newTrack._id]: [0, 0, 0] }));
                setVolumes(prev => ({ ...prev, [newTrack._id]: 0 }));
                setIsMute(prev => ({ ...prev, [newTrack._id]: false }));
                
                console.log("Traccia caricata con successo:", data.fileName);
                event.target.value = null; 
            } else {
                console.error("Errore dal server durante il caricamento");
            }
        } catch (error) {
            console.error("Errore di comunicazione col backend:", error);
        }
    };

    const salvaProgettoIntero = async () => {
    // 1. Creiamo un array mappando le tracce correnti e assemblando i valori dai vari stati
    const payload = tracks.map(t => {
        const tId = t._id;
        const tracciaKnobs = knobsValues[tId] || [0, 0, 0];
        
        return {
            trackId: tId,
            volume: volumes[tId] ?? 0,
            isMuted: isMute[tId] ?? false,
            eq: {
                high: tracciaKnobs[0],
                mid: tracciaKnobs[1],
                low: tracciaKnobs[2]
            }
        };
    });

    // 2. Spediamo l'array gigante al backend
    try {
        const response = await fetch(`http://localhost:3000/api/session/${sessionId}/state/bulk`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Progetto salvato con successo! 💾");
        } else {
            console.error("Errore durante il salvataggio del mixer.");
        }
    } catch (error) {
        console.error("Errore di rete durante il salvataggio:", error);
    }
};

const handelClick = async () => {
        await salvaProgettoIntero()
        window.location.href = "http://localhost:5173/";
    }

    // --- PROTEZIONE RENDER ---
    // Se non ci sono tracce, peschiamo valori finti per non rompere il JSX
    const currentTrackId = tracks[trackCounter]?._id || null;
    const currentAudioSource = currentTrackId ? playersRef.current[currentTrackId] : null;
    const currentKnobs = currentTrackId ? (knobsValues[currentTrackId] || [0, 0, 0]) : [0, 0, 0];
    const currentVolume = currentTrackId ? (volumes[currentTrackId] || 0) : 0;
    const currentMute = currentTrackId ? (isMute[currentTrackId] || false) : false;
    const currentPlaying = currentTrackId ? (playingStates[currentTrackId] || false) : false;

    return (
        <section>
            <div className='header-curvo'></div>
            <div className='header'>
                <div className='title'>
                    <h1>{roomName || "Caricamento..."}</h1>
                    <p>codice stanza: <span onClick={copyOnClick} style={{cursor: 'pointer'}}>{roomCode}</span></p>
                </div>
                <div className='btnWrap'>
                    <Button icon={ExitIcon} callback={handelClick}/>
                </div>
            </div>

            {/* SE LA STANZA È VUOTA, MOSTRA UN MESSAGGIO DIVERSO */}
            {tracks.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
                    <h2>Nessuna traccia presente</h2>
                    <p>Inizia ad aggiungere file audio a questo mixer!</p>
                </div>
            ) : (
                <>
                    <div className='knobsContainer'>
                        <Knob freq="HF" value={currentKnobs[0]} onChange={(val) => handleFreqChange(0, val)}/>
                        <Knob freq="MF" value={currentKnobs[1]} onChange={(val) => handleFreqChange(1, val)}/>
                        <Knob freq="LF" value={currentKnobs[2]} onChange={(val) => handleFreqChange(2, val)}/>
                    </div>

                    {currentAudioSource && <FreqDisplay audioSource={currentAudioSource}/>}

                    <div className='faderContainer'>
                        <Fader value={currentVolume} onChange={handleVolumeChange}/>
                    </div>

                    <div className='buttonContainer'>
                        <div className='buttonWrap'>
                            <Button text={currentMute ? "Unmute" : "Mute"} callback={handleMute}/>
                        </div>
                        <div className='buttonWrap'>
                            <Button icon={currentPlaying ? pauseIcon : playIcon} callback={handlePlay}/>
                        </div>
                    </div>
                    
                    <div className="carouselContainer">
                        <h3>{tracks[trackCounter]?.name}</h3>
                        <div className='buttonContainer'>
                            <img onClick={prevTrack} src={nextIcon} className="prevTrack" alt="Previous"/>
                            {tracks.map((t, idx) => <Dot key={t._id} id={t._id} track={trackCounter === idx ? t._id : null} />)}
                            <img onClick={nextTrack} src={nextIcon} className="nextTrack" alt="Next"/>
                        </div>
                    </div>
                </>
            )}

            <div className='trackButtonWrap' style={{marginTop: '20px'}}>
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