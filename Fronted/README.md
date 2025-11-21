# Frontend Certificadora - Sistema de Facturación Electrónica FEL

Frontend React completo para el sistema de certificación de facturas electrónicas de Guatemala (FEL).

## Características

- **Autenticación JWT** - Login y registro de usuarios con almacenamiento seguro del token
- **Dashboard** - Estadísticas en tiempo real (total, certificadas, pendientes, errores)
- **Gestión de Facturas** - CRUD completo con cálculo automático de totales e IVA
- **Gestión de Emisores** - Administración de emisores con activación/desactivación
- **Certificación DTE** - Interfaz para certificar documentos tributarios electrónicos con lista de facturas
- **Gestión de Usuarios** - Administración completa de usuarios del sistema (solo admin)
- **Diseño Elegante** - Interfaz moderna con colores neutrales profesionales
- **Responsive** - Completamente adaptable a dispositivos móviles

## Requisitos Previos

- Node.js 18+ y npm
- API Certificadora ejecutándose en `http://localhost:9090`

## Instalación

1. Navegar a la carpeta del proyecto:
\`\`\`bash
cd Frontend-React-Certificadora
\`\`\`

2. Instalar dependencias:
\`\`\`bash
npm install
\`\`\`

3. Iniciar el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

4. Abrir en el navegador:
\`\`\`
http://localhost:5173
\`\`\`

## Estructura del Proyecto

\`\`\`
Frontend-React-Certificadora/
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # Layout principal con sidebar
│   │   └── Layout.css              # Estilos del layout
│   ├── context/
│   │   └── AuthContext.jsx         # Contexto de autenticación JWT
│   ├── pages/
│   │   ├── Login.jsx               # Página de login/registro
│   │   ├── Login.css               # Estilos del login
│   │   ├── Dashboard.jsx           # Dashboard con estadísticas
│   │   ├── Dashboard.css           # Estilos del dashboard
│   │   ├── Facturas.jsx            # Gestión de facturas (CRUD)
│   │   ├── Facturas.css            # Estilos de facturas
│   │   ├── Emisores.jsx            # Gestión de emisores
│   │   ├── Emisores.css            # Estilos de emisores
│   │   ├── Certificar.jsx          # Certificación de DTEs
│   │   ├── Certificar.css          # Estilos de certificación
│   │   ├── Usuarios.jsx            # Gestión de usuarios
│   │   └── Usuarios.css            # Estilos de usuarios
│   ├── services/
│   │   └── api.js                  # Cliente Axios con interceptores JWT
│   ├── App.jsx                     # Componente principal con rutas
│   ├── main.jsx                    # Punto de entrada
│   └── index.css                   # Estilos globales y variables CSS
├── index.html                      # HTML principal
├── package.json                    # Dependencias
├── vite.config.js                  # Configuración de Vite
└── README.md                       # Este archivo
\`\`\`

## Configuración de la API

El frontend se conecta a la API en `http://localhost:9090`. Si necesitas cambiar la URL, edita el archivo:

\`\`\`javascript
// src/services/api.js
const api = axios.create({
  baseURL: "http://localhost:9090/api", // Cambiar aquí si es necesario
  headers: {
    "Content-Type": "application/json",
  },
})
\`\`\`

## Funcionalidades por Página

### Login/Registro
- Inicio de sesión con usuario y contraseña
- Registro de nuevos usuarios
- Almacenamiento seguro del token JWT en localStorage
- Redirección automática al dashboard después del login

### Dashboard
- **Estadísticas en tiempo real:**
  - Total de facturas en el sistema
  - Facturas certificadas exitosamente
  - Facturas pendientes de certificar
  - Facturas con error en certificación
- Vista de resumen con tarjetas coloridas
- Actualización automática de estadísticas

### Facturas
- **Listar** todas las facturas con búsqueda
- **Crear** nueva factura con múltiples detalles/items
- **Editar** factura (solo si está en estado PENDIENTE)
- **Eliminar** factura (solo si NO está certificada)
- **Búsqueda** por número, cliente o NIT
- **Cálculo automático** de subtotal, IVA (12%) y total
- Vista en tabla responsive
- Modal elegante para crear/editar

### Emisores
- Vista en tarjetas de todos los emisores
- Información completa: NIT, nombre, dirección, etc.
- Activar/desactivar emisores con un click
- Diseño responsive en grid

### Certificar
- **Formulario manual** para certificar DTEs con XML
- **Lista de facturas** a la derecha con:
  - Todas las facturas del sistema
  - Búsqueda rápida
  - Botón para certificar facturas pendientes directamente
  - Estado de cada factura (Pendiente, Certificada, Error)
- **Resultados de certificación:**
  - UUID
  - Número de autorización
  - Serie y número
  - Fecha de certificación
  - XML certificado completo
- Actualización automática después de certificar

### Usuarios (Solo Admin)
- **Listar** todos los usuarios del sistema
- **Editar** información de usuarios (nombre, email, rol)
- **Activar/Desactivar** usuarios
- **Eliminar** usuarios
- **Gestión de roles** (ADMIN, USER)
- Vista en tarjetas con avatares
- Búsqueda por nombre, usuario o email

## Credenciales de Prueba

Según la configuración por defecto de tu API:

\`\`\`
Usuario: one
Contraseña: password
Rol: ADMIN
\`\`\`

## Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **React Router DOM 6** - Enrutamiento SPA
- **Axios** - Cliente HTTP con interceptores
- **Lucide React** - Iconos modernos y elegantes
- **Vite** - Build tool ultra rápido
- **CSS Variables** - Sistema de tematización

## Scripts Disponibles

\`\`\`bash
# Desarrollo (puerto 5173)
npm run dev

# Build para producción
npm run build

# Preview del build de producción
npm run preview

# Linting del código
npm run lint
\`\`\`

## Sistema de Colores

El diseño usa una paleta de colores neutrales y profesionales:

- **Primary**: #171717 (Negro suave para elementos principales)
- **Secondary**: #f5f5f5 (Gris claro para fondos)
- **Success**: #22c55e (Verde para estados exitosos)
- **Warning**: #f59e0b (Naranja para advertencias)
- **Error**: #ef4444 (Rojo para errores)
- **Foreground**: #0a0a0a (Texto principal)
- **Muted**: #737373 (Texto secundario)

## Flujo de Trabajo Típico

1. **Login** con credenciales
2. Ver **Dashboard** con estadísticas
3. Ir a **Facturas** y crear una nueva factura
4. Agregar detalles/items a la factura (se calcula automáticamente el total)
5. La factura se guarda en estado PENDIENTE
6. Ir a **Certificar** y encontrar la factura en la lista de la derecha
7. Click en "Certificar" para enviarla a la SAT
8. Ver resultado de la certificación (UUID, número de autorización)
9. La factura ahora está en estado CERTIFICADA

## Validaciones del Sistema

### Facturas
- Todos los campos son requeridos excepto dirección del cliente
- Los montos deben ser mayores a 0
- Debe haber al menos un detalle/item
- Solo se pueden editar facturas PENDIENTES
- Solo se pueden eliminar facturas NO CERTIFICADAS

### Usuarios
- Email debe ser válido
- Los roles se seleccionan de una lista predefinida
- Solo ADMIN puede gestionar usuarios

## Notas Importantes

1. **JWT Token**: 
   - El token se almacena en `localStorage` con la clave `token`
   - Se envía automáticamente en el header `Authorization: Bearer <token>`
   - Si el token expira, el usuario debe iniciar sesión nuevamente

2. **CORS**: 
   - La API debe tener CORS habilitado para `http://localhost:5173`
   - Verifica en `SecurityConfig.java` que el puerto esté permitido

3. **Validaciones**: 
   - El frontend valida datos antes de enviar
   - El backend también valida con Bean Validation
   - Los errores se muestran con mensajes claros

4. **Permisos**: 
   - Algunas funciones requieren rol ADMIN
   - El sidebar muestra todas las opciones (la API valida permisos)

## Problemas Comunes y Soluciones

### Error de conexión con la API
**Problema**: `Network Error` o `ERR_CONNECTION_REFUSED`

**Solución**:
- Verificar que la API esté ejecutándose en `http://localhost:9090`
- Verificar que no haya firewall bloqueando el puerto
- Revisar los logs de la API para ver si está levantada

### Error 401 (Unauthorized)
**Problema**: `Request failed with status code 401`

**Solución**:
- El token JWT puede haber expirado
- Cerrar sesión y volver a iniciar sesión
- Verificar que el token se esté enviando en las peticiones (Developer Tools > Network)

### No se pueden crear facturas - Error 400
**Problema**: `Request failed with status code 400`

**Solución**:
- Verificar que todos los campos requeridos estén llenos
- Los montos deben ser números válidos mayores a 0
- Debe haber al menos un detalle en la factura
- El campo `linea` se genera automáticamente (no manual)

### Error de CORS
**Problema**: `Access-Control-Allow-Origin` error

**Solución**:
- Verificar en `SecurityConfig.java` de la API que `http://localhost:5173` esté permitido
- Reiniciar la API después de cambios en CORS

### Facturas no aparecen en Certificar
**Problema**: La lista de facturas está vacía

**Solución**:
- Verificar que se hayan creado facturas primero
- Revisar los permisos del usuario
- Verificar en Network tab que la petición a `/api/facturas` sea exitosa

## Integración con la API

### Endpoints utilizados:

**Auth:**
- POST `/api/auth/login` - Iniciar sesión
- POST `/api/auth/register` - Registrar usuario

**Facturas:**
- GET `/api/facturas` - Listar todas
- POST `/api/facturas` - Crear nueva
- GET `/api/facturas/{id}` - Obtener una
- PUT `/api/facturas/{id}` - Actualizar
- DELETE `/api/facturas/{id}` - Eliminar
- POST `/api/facturas/{id}/certificar` - Certificar una factura
- GET `/api/facturas/estado/{estado}` - Filtrar por estado

**Emisores:**
- GET `/api/emisores` - Listar todos
- PUT `/api/emisores/{id}/activar` - Activar
- PUT `/api/emisores/{id}/desactivar` - Desactivar

**Certificación:**
- POST `/api/certificacion/certificar` - Certificar DTE con XML

**Usuarios:**
- GET `/api/usuarios/me` - Perfil actual
- GET `/api/usuarios` - Listar todos (admin)
- GET `/api/usuarios/{id}` - Obtener uno (admin)
- PUT `/api/usuarios/{id}` - Actualizar (admin)
- DELETE `/api/usuarios/{id}` - Eliminar (admin)
- PUT `/api/usuarios/{id}/activar` - Activar (admin)
- PUT `/api/usuarios/{id}/desactivar` - Desactivar (admin)

## Mejoras Futuras Sugeridas

- [ ] Exportar facturas a PDF
- [ ] Gráficas de estadísticas en el dashboard
- [ ] Filtros avanzados en todas las tablas
- [ ] Paginación para listas grandes
- [ ] Notificaciones en tiempo real
- [ ] Modo oscuro
- [ ] Múltiples idiomas (i18n)
- [ ] Historial de cambios en facturas
- [ ] Búsqueda avanzada con filtros múltiples

## Soporte

Para reportar problemas, solicitar nuevas funcionalidades o hacer preguntas, contacta al equipo de desarrollo.

## Licencia

Este proyecto es privado y confidencial.
