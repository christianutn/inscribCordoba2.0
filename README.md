# 🚀 InscribCórdoba

**Plataforma de Gestión de Inscripciones y Recursos para la Provincia de Córdoba.**

![Badge Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Badge React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Badge Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Badge MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Badge Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![Badge Material UI](https://img.shields.io/badge/Material%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Branch](https://img.shields.io/badge/Branch-cunix-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-En%20Desarrollo-yellowgreen?style=for-the-badge)


## 📝 Descripción del Proyecto

InscribCórdoba es una aplicación web full-stack diseñada para optimizar y centralizar la gestión de inscripciones, cursos, usuarios y entidades asociadas dentro del ámbito del Gobierno de la Provincia de Córdoba. Proporciona una interfaz intuitiva para usuarios y herramientas administrativas para la gestión eficiente de datos.

## ✨ Características Principales

*   **Gestión de Usuarios:** Registro, autenticación segura (Login, JWT), y flujo de recuperación de contraseñas.
*   **ABM General:** Interfaz unificada de Alta, Baja y Modificación para diversas entidades (Ministerios, Áreas, Personas, Tutores, Medios de Inscripción, Plataformas de Dictado, Tipos de Capacitación, Usuarios).
*   **Gestión de Cursos:** Alta, modificación y seguimiento de cursos y capacitaciones.
*   **Asignación de Áreas:** Funcionalidad para asignar áreas específicas a usuarios.
*   **Visualización de Avisos:** Sección para mostrar avisos importantes a los usuarios.
*   **Accesos Rápidos:** Enlaces directos a plataformas y recursos relacionados.
*   **Exportación de Datos:** Posibilidad de descargar datos tabulares en formato Excel.
*   **Integraciones:** Con Google Sheets API (para actualización de datos) y API de Feriados (ArgentinaDatos).

## 🛠️ Tecnologías Utilizadas

*   **Backend:**
    *   Node.js (Runtime)
    *   Express.js (Framework)
    *   Sequelize (ORM para Base de Datos)
    *   MySQL / MariaDB (Base de Datos, a través de `mysql2`)
    *   Passport.js (Autenticación Local y JWT)
    *   Bcrypt (Hash de Contraseñas)
    *   JSON Web Tokens (JWT)
    *   CORS (Manejo de Orígenes Cruzados)
    *   Dotenv (Gestión de Variables de Entorno)
    *   Googleapis (Integración con Google Sheets)
    *   Nodemailer (Envío de Emails, usado para recuperación de contraseña)
    *   Express Rate Limit (Control de Tasa de Solicitudes)
*   **Frontend:**
    *   React (Librería principal)
    *   Next.js (Framework, basado en la estructura `pages/`)
    *   Material UI (MUI) (Componentes de UI y Estilos)
    *   React Router (Gestión de Rutas en el lado del cliente)
    *   DOMPurify (Sanitización de HTML)
    *   DataGrid (@mui/x-data-grid)
    *   Fetch API / Axios (Comunicación con el Backend)
*   **Base de Datos:**
    *   MySQL / MariaDB

## 📁 Estructura del Proyecto

La estructura principal del repositorio en la rama `cunix` sigue una convención que separa el código fuente del backend y frontend (o los mezcla en la raíz con carpetas como `src/`). La lógica de negocio y acceso a datos reside en el backend, mientras que la interfaz de usuario y la interacción con el usuario están en el frontend.
