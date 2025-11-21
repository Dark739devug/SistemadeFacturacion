// 1. Configuración de la URL base
const BASE_URL = 'http://localhost:9090/api'; 

const ENDPOINTS = {
    // Autenticación
    login: `${BASE_URL}/auth/login`, 
    logout: `${BASE_URL}/auth/logout`, 
    registro: `${BASE_URL}/auth/registro`, 

    // Clientes
    clientes: `${BASE_URL}/clientes`, 
    clientesActivos: `${BASE_URL}/clientes/activos`,
    clientePorId: (id) => `${BASE_URL}/clientes/${id}`,
    clientePorNit: (nit) => `${BASE_URL}/clientes/nit/${encodeURIComponent(nit)}`, // <--- NUEVO
    desactivarCliente: (id) => `${BASE_URL}/clientes/${id}/desactivar`,

    // Establecimientos
    establecimientos: `${BASE_URL}/establecimientos`,
    establecimientoPorId: (id) => `${BASE_URL}/establecimientos/${id}`,
    establecimientoPorNit: (nit) => `${BASE_URL}/establecimientos/nit/${encodeURIComponent(nit)}`, // <--- NUEVO
    desactivarEstablecimiento: (id) => `${BASE_URL}/establecimientos/${id}/desactivar`,

    // Productos
    productos: `${BASE_URL}/productos`,
    productoPorId: (id) => `${BASE_URL}/productos/${id}`,
    productosBuscar: (q) => `${BASE_URL}/productos/buscar?q=${encodeURIComponent(q)}`,
    productosPorCategoria: (id) => `${BASE_URL}/productos/categoria/${id}`,
    categorias: `${BASE_URL}/categorias`,

    // Usuarios
    usuarios: `${BASE_URL}/usuarios`,
    usuarioPorId: (id) => `${BASE_URL}/usuarios/${id}`,

    // Facturas
    facturas: `${BASE_URL}/facturas`,
    obtenerJsonDte: (id) => `${BASE_URL}/facturas/${id}/json-pre-certificacion`,
};

export default ENDPOINTS;