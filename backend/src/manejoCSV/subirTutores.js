import express from "express";
import indexRoutes from "../routes/index.routes.js";
import inicializarPassport from "../config/passport.js";
import cors from "cors";
import sequelize from "../config/database.js";
import associateModels from "../models/asociateModelos.js";
import fs from 'fs';
import csv from 'csv-parser';
import Tutor from "../models/tutor.models.js";

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

            
            const tutor = {
                cuil: row.cuil ? row.cuil.trim() : row.cuil,
                area: row.codArea ? row.codArea.trim() : row.codArea,
                esReferente: row.referente ? row.referente.trim() : row.referente
            };

            

            (async () => {
                let res = await crearTutor(tutor);
                
            })();
        });
    });

const crearTutor = async (tutor) => {
    const { cuil, area, esReferente } = tutor;

    try {
        const nuevoTutor = await Tutor.create({
            cuil,
            area,
            esReferente
        });
        
        return nuevoTutor;
    } catch (error) {
        console.log(error);
        return error;
    }
};

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));