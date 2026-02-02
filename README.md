# Sistema de Gestión de Becas IMAS - v1.0 🇨🇷

¡Bienvenido al repositorio oficial del **Sistema de Gestión de Becas del Instituto Mixto de Ayuda Social (IMAS)**! Esta plataforma permite gestionar de manera integral el ciclo de vida de una solicitud de beca, desde el registro del solicitante hasta la evaluación técnica y reportes administrativos.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend:** [JSON-Server](https://github.com/typicode/json-server) (Simulación de API RESTful).
- **Iconografía:** Font Awesome 6.4.0.
- **Gráficos:** Chart.js (Panel de Reportes).

---

## 🚀 Guía de Instalación Paso a Paso

Sigue estas instrucciones para tener el sistema funcionando en tu computadora local:

### 1. Instalar Node.js
Es fundamental para correr el servidor de datos.
- Descarga e instala la versión **LTS** (Recomendado) desde [nodejs.org](https://nodejs.org/).
- Verifica la instalación abriendo una terminal y escribiendo:
  ```bash
  node -v
  npm -v
  ```

### 2. Configurar el Proyecto
1. Descarga o clona este repositorio.
2. Abre tu terminal o consola y navega hasta la carpeta del proyecto:
   ```bash
   cd Sitio-IMAS/Backend
   ```
3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

### 3. Iniciar el Sistema
Para que el sistema funcione, el "servidor" (Backend) debe estar encendido:
1. En la carpeta `Backend`, ejecuta:
   ```bash
   npm start
   ```
2. Verás un mensaje indicando que el servidor está corriendo en `http://localhost:3000`. **¡No cierres esta ventana!**

### 4. Acceder a la Aplicación
- Abre el archivo `Frontend/pages/login.html` en tu navegador (Chrome o Edge recomendados).

---

## 🔐 Roles y Credenciales de Prueba

| Rol | Correo Electrónico | Contraseña | Funciones |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@imas.com` | `admin` | Gestión de becas, registro de evaluadores y reportes. |
| **Evaluador** | `evaluador@imas.com` | `evaluador` | Revisión de solicitudes pendientes y asignación de puntajes. |
| **Solicitante** | (Cualquier registro) | (Definida por usuario) | Postulación a becas y consulta de historial. |

---

## 📝 Notas para el Equipo de Diseño (CSS)

El sistema ya cuenta con una estructura sólida de clases y un archivo `main.css` unificado. Aquí tienes los puntos clave para finalizar el pulido visual:

- **Paleta de Colores:** Se han definido variables raíz (`:root`) en `main.css`. Por favor, utiliza `var(--primary-blue)`, `var(--secondary-blue)` y `var(--accent-gold)` para mantener la identidad institucional.
- **Identidad:** Todas las páginas ya incluyen el logo del IMAS en el header (`.logo-imas`). Asegúrate de que las sombras y márgenes sean consistentes.
- **Responsividad:** El sistema es funcional en pantallas grandes. Falta optimizar los `@media queries` para dispositivos móviles pequeños (específicamente el panel de reportes y las tablas de gestión).
- **Login:** La página de login usa un sistema de capas (Overlay). Se ha integrado con el `main.css` pero requiere un toque extra de animaciones para que se sienta más moderno.

---

## 📁 Estructura del Repositorio

- `/Backend`: Contiene el archivo `db.json` (base de datos) y la configuración del servidor.
- `/Frontend`: Toda la interfaz de usuario.
  - `/js`: Lógica modularizada (`api.js` para conexiones, `auth.js` para seguridad).
  - `/pages`: Vistas HTML.
  - `/styles`: `main.css` (estilos globales) y estilos específicos.

---

## ✅ Lo que se completó en esta v1
- [x] Unificación del sistema de navegación (Headers y Footers consistentes).
- [x] Corrección de bugs críticos en el historial de postulaciones.
- [x] Robustez en la lógica de evaluación (validación de campos y sumatorias).
- [x] Inclusión de seguridad básica (protección de rutas por rol en JS).
- [x] Panel de reportes dinámico con Chart.js.

---
*Desarrollado para el Instituto Mixto de Ayuda Social – Gestión de Becas 2026.*
