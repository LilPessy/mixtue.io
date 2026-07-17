import './Dot.css'
function Dot({id, track}){
    return(
        <div className="dot" style={{backgroundColor: track===id ? '#87EAFE' : '#D9D9D9'}}></div>
    )
}

export default Dot