import React, { useState, useEffect } from 'react';
import './Navbar.css';
function Navbar({username, propic}){

    const url = "http://localhost:3000" + propic

    return(
        <nav className='navbar'>
            <div className='Names'>
                <h1>Buonasera</h1>
                <h2>{username}</h2>
            </div>

            <div className='Profile'>
                {propic ? (
                    <img className='profile-pic' src={url} alt="Immagine profilo" />
                ) : (
                    <div className='placeholder'>Ospite</div>
                )}
            </div>
        </nav>
    )
}
export default Navbar;