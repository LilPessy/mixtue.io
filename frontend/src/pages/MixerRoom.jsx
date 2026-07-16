import './MixerRoom.css'
import Button from '../components/Button'
import Knob from '../components/Knob'
import ExitIcon from '../assets/exit.png'

function MixerRoom(){

    const handelClick = ()=>{
        window.location.href = "http://localhost:5173/"
    }

    return(
        <section>
            <div className='header-curvo'></div>
            <div className='header'>
                <div className='title'>
                    <h1>
                        Amore amaro
                    </h1>
                    <p>di Matteo Maria Romano</p>
                </div>
                <div className='btnWrap'>
                    <Button icon={ExitIcon} callback={handelClick}/>
                </div>
            </div>

            <div className='knobsContainer'>
                <Knob freq="HF"/>
                <Knob freq="MF"/>
                <Knob freq="LF"/>
            </div>

        </section>
    )
}

export default MixerRoom