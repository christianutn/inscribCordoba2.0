import express from "express";
import indexRoutes from "../routes/index.routes.js";
import inicializarPassport from "../config/passport.js";
import cors from "cors";
import sequelize from "../config/database.js";
import associateModels from "../models/asociateModelos.js";
import fs from 'fs';
import csv from 'csv-parser';
import instanciaModel from "../models/instancia.models.js";
import Persona from "../models/persona.models.js";

const app = express();

// Inicialización de Sequelize
const initSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
        associateModels();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Llamada a la función para inicializar Sequelize
initSequelize();

app.use(cors());

const PORT = 4000;

// Middleware
app.use(express.json());
inicializarPassport();
app.use("/api", indexRoutes);

// Middleware para manejar errores
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message || "Error Interno" });
});

// Leer un archivo .CSV después de la sincronización de modelos
const results = [];
fs.createReadStream('./bd_altaTutores.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
        results.push(data); // Añadir cada fila de datos a results
    })
    .on('end', () => {
        // Procesar cada fila de resultados
        results.forEach(row => {

            
            const persona = {
                cuil: row.cuil ? row.cuil.trim() : row.cuil,
                nombre: row.nombre ? row.nombre.trim() : row.nombre,
                apellido: row.apellido ? row.apellido.trim() : row.apellido,
                mail: row.mail ? row.mail.trim() : row.mail
            };

            

            (async () => {
                let res = await crearPersona(persona);
                
            })();
        });
    });

const crearPersona = async (persona) => {
    const { nombre, apellido, cuil, mail } = persona;

    try {
        const nuevaPersona = await Persona.create({
            nombre,
            apellido,
            cuil,
            mail
        });
        
        return nuevaPersona;
    } catch (error) {
        
        return error;
    }
};

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));