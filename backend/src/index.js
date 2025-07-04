import express from "express";
import indexRoutes from "./routes/index.routes.js";
import inicializarPassport from "../src/config/passport.js";
import cors from "cors";
import sequelize from "./config/database.js";
import associateModels from "./models/asociateModelos.js";
import 'dotenv/config';
import enviarCorreoDiarioContolDeCursos from "./googleSheets/utils/enviarCorreoDiarioControlDeCursos.js";
import syncModels from "./config/sync.database.js";
import manejarErrorGlobales from "./middlewares/manejoGlobalErrores.js";

// --- 1. Creación de la instancia de la aplicación ---
const app = express();

// --- 2. Middlewares y Configuración ---
app.use(cors());
app.use(express.json());
inicializarPassport();

// --- 3. Rutas ---
app.use("/api", indexRoutes);

// Endpoint de prueba
app.get("/api/ping", (req, res) => {
    const responseData = {
        message: "El backend está escuchando.",
        timestamp: new Date().toISOString(),
    };
    res.status(200).json(responseData);
});

// --- 4. Middlewares de Manejo de Errores (van al final) ---
app.use((req, res, next) => {
    const error = new Error(`Ruta ${req.originalUrl} no encontrada`);
    error.status = 404;
    next(error);
});
app.use(manejarErrorGlobales);


// --- 5. Función de Arranque del Servidor ---
const startServer = async () => {
    try {
        // Inicialización de la Base de Datos
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
       
        associateModels();
        // NOTA: syncModels() no se llama aquí porque asumo que associateModels ya lo maneja
        // o se maneja a través de migraciones. Si necesitas sincronizar, descomenta la siguiente línea.
        // await syncModels(); 
        console.log('Models associated successfully.');

        // Tareas programadas o iniciales
        enviarCorreoDiarioContolDeCursos();

        // Inicio del servidor
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    } catch (error) {
        console.error('Unable to start the server:', error);
        process.exit(1); // Salir del proceso si no se puede conectar a la BD
    }
};

// --- 6. Ejecución del Servidor (si este archivo es el punto de entrada principal) ---
// La condición `process.env.NODE_ENV !== 'test'` es CLAVE.
// Evita que el servidor se inicie automáticamente cuando Jest importe este archivo.
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// --- 7. Exportar la instancia de `app` para los tests ---
export default app;