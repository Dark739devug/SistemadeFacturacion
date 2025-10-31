'use client';

import React, { useState } from 'react';

export default function FacturaFormulario() {
  const [formData, setFormData] = useState({
    clienteNombre: '',
    clienteNIT: '',
    direccion: '',
    telefono: '',
    productos: [
      { descripcion: '', cantidad: 0, precioUnitario: 0, descuento: 0 }
    ],
    observaciones: ''
  });

  const handleChange = (e, index, field) => {
    if (field === 'productos') {
      const newProductos = [...formData.productos];
      newProductos[index][e.target.name] = e.target.value;
      setFormData({ ...formData, productos: newProductos });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleAddProducto = () => {
    setFormData({ ...formData, productos: [...formData.productos, { descripcion: '', cantidad: 0, precioUnitario: 0, descuento: 0 }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Error al enviar la factura');
      const result = await response.json();
      alert('Factura enviada correctamente!');
      console.log(result);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al enviar la factura.');
    }
  };

  return (
    <form className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 text-gray-800" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-6">Factura Electronica</h2>

      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Datos del Cliente</h3>
        <input
          type="text"
          name="clienteNombre"
          placeholder="Nombre"
          className="w-full mb-2 p-2 border rounded"
          value={formData.clienteNombre}
          onChange={handleChange}
        />
        <input
          type="text"
          name="clienteNIT"
          placeholder="NIT"
          className="w-full mb-2 p-2 border rounded"
          value={formData.clienteNIT}
          onChange={handleChange}
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          className="w-full mb-2 p-2 border rounded"
          value={formData.direccion}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          className="w-full mb-2 p-2 border rounded"
          value={formData.telefono}
          onChange={handleChange}
        />
      
        
      
      </div>

          

    

    </form>
  );
}
