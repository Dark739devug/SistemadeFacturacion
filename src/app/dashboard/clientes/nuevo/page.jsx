'use client';

import React from 'react';

export default function NuevoClientePage() {
  return (
    <div>
      <form >
        <h1>Nuevo Cliente</h1>
        <h2> NIT</h2>
       <input type="text" name="NIT" placeholder="Ingrese su NIT" />
       <h2> Nombre o Razón Social</h2>
       <input type="text" name="nombre" placeholder="Ingrese su nombre o razón social" />
       <h2>Direccion</h2>
       <input type="text" name="direccion" placeholder="Ingrese su dirección" />
         <h2> Teléfono</h2>
       <input type="text" name="telefono" placeholder="Ingrese su teléfono" />


      </form>
    </div>
  );
}