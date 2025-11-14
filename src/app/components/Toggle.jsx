'use client'

import React from 'react';

export default function Toggle({activo, onChange, disabled=false }) {
    return (
    <button onClick={()=> !disabled && onChange(!activo)}
        disabled={disabled}
        style={{
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 0,
            opacity: disabled ? 0.6 : 1,
            transition: 'opacity 0.2s',
        }}
        title={activo ? 'Desactivar' : 'Activar'}
        aria-label={activo ? 'Desactivar Cliente' : 'Activar Cliente'}
        > 
        {activo ? (
            <svg xmlns="http://www.w3.org/2000/svg" 
            width="32" height="32" viewBox="0 0 24 24" 
            fill="#04C204" >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M16 9a3 3 0 1 1 -3 3l.005 -.176a3 3 0 0 1 2.995 -2.824" />
            <path d="M16 5a7 7 0 0 1 0 14h-8a7 7 0 0 1 0 -14zm0 2h-8a5 5 0 1 0 0 10h8a5 5 0 0 0 0 -10" />
            </svg>
            ):(<svg xmlns="http://www.w3.org/2000/svg" 
            width="32" height="32" viewBox="0 0 24 24" 
            fill="#FF0217" >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M8 9a3 3 0 1 1 -3 3l.005 -.176a3 3 0 0 1 2.995 -2.824" />
            <path d="M16 5a7 7 0 0 1 0 14h-8a7 7 0 0 1 0 -14zm0 2h-8a5 5 0 1 0 0 10h8a5 5 0 0 0 0 -10" />
            </svg>)}
        
        </button>
    

    
    );
    
}