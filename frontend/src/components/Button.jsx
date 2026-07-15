import './Button.css';

function Button({text,icon,callback}){
    return (
    <div className="button" onClick={callback}>
        {icon ? <img src={icon}/> : <span>{text}</span> }
    </div>
    )
}

export default Button