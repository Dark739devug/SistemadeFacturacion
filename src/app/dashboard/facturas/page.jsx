'use client'

import React from 'react';
import styles from './facturacion.module.css';
import { ToastContainer } from 'react-toastify';
import Sidebar from '../../components/Sidebar';



export default function Factura() {
  return (
 
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Facturas</h1>
          <p className={styles.descripcion}>Gestiona todas tus facturas en un solo lugar.</p>
        </div>
        <button className={styles.boton}>Crear Factura</button>
      </div>

      <div className={styles.filterBar}>
        <input
          type="search"
          placeholder="Buscar factura o cliente..."
          className={styles.input}
        />

        <select className={styles.select}>
          <option value="Todos">Estado: Todos</option>
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <input
          type="date"
          className={styles.input}
        />

        <select className={styles.select}>
          <option value="FechaDesc">Ordenar Por: Fecha (recientes)</option>
          <option value="FechaAsc">Fecha (antiguas)</option>
          <option value="MontoDesc">Monto (mayor)</option>
          <option value="MontoAsc">Monto (menor)</option>
        </select>



      </div>

      <table className={styles.factura}>
        <thead>
          <tr>
            <th>Factura No.</th>
            <th>Nombre del cliente</th>
            <th>Fecha de emisión</th>
            <th>Monto total</th>
            <th>Estado</th>
            <th>Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#001</td>
            <td>Acme Corp</td>
            <td>2025-10-16</td>
            <td>Q1,200.00</td>
            <td>Pagado</td>
            <td>Q1,200.00</td>
            <td> 
              <button> 
               <svg xmlns="http://www.w3.org/2000/svg" 
               width="24" 
               height="24"
               viewBox="0 0 24 24" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="1.75" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
               >
                <path 
                stroke="none" 
                d="M0 0h24v24H0z" 
                fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
             </button>
              <button><svg xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.75" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" /></svg> </button>
            </td>
          </tr>
          <tr>
            <td>#002</td>
            <td>starlink </td>
            <td>2025-10-10</td>
            <td>Q2,500.00</td>
            <td>Pendiente</td>
            <td>Q2,500.00</td>
          </tr>
        </tbody>
      </table>

      <ToastContainer />
    </div>
    
  );
}
