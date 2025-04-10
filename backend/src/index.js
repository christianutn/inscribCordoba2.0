import express from "express";
import indexRoutes from "./routes/index.routes.js"
import inicializarPassport from "../src/config/passport.js"
import cors from "cors";
import sequelize from "./config/database.js";
import associateModels from "./models/asociateModelos.js";
import 'dotenv/config';



const app = express();

// Inicialización de Sequelize
const initSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        // Sincronización de modelos
        // await sequelize.sync({ alter: true }); // Opciones como 'alter: true' pueden ser útiles para aplicaciones en desarrollo
        associateModels();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Llamada a la función para inicializar Sequelize
initSequelize();

app.use(cors());

const PORT = 4000 //Recordar cambiara puerto 4000 al subir cambios

//MIdleware
app.use(express.json());
inicializarPassport();



app.use("/api", indexRoutes);

// Endpoint de prueba para verificar que el backend está funcionando
app.get("/api/ping", (req, res) => {
    const responseData = {
        message: "El backend está escuchando.",
        timestamp: new Date().toISOString(), // Marca de tiempo actual
        method: req.method, // Método de la solicitud (GET, POST, etc.)
        url: req.originalUrl, // URL original de la solicitud
        headers: req.headers, // Cabeceras de la solicitud
    };

    res.status(200).json(responseData);
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
    const error = new Error(`Ruta ${req.originalUrl} no encontrada`);
    error.status = 404; // Establecer el código de estado 404
    next(error); // Pasar el error al siguiente middleware
});

// Middleware para manejar errores generales y loguearlos en la consola
app.use((err, req, res, next) => {
    console.log("INFO ERROR: ", {
        message: err.message || err,
        url: req.originalUrl, // Captura la URL de la petición
        method: req.method, // Captura el método de la petición (GET, POST, etc.)
        status: err.statusCode || 500 // Captura el código de estado
    });

    res.status(err.statusCode || 500).json({ message: err.message || "Error Interno" });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`))



