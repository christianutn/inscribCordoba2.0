import express from "express";
import indexRoutes from "../routes/index.routes.js";
import inicializarPassport from "../config/passport.js";
import cors from "cors";
import sequelize from "../config/database.js";
import associateModels from "../models/asociateModelos.js";
import fs from 'fs';
import csv from 'csv-parser';
import instanciaModel from "../models/instancia.models.js";

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
fs.createReadStream('./bd_instancias.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
        results.push(data); // Añadir cada fila de datos a results
    })
    .on('end', () => {
        // Procesar cada fila de resultados
        results.forEach(row => {
            const instancia = {
                curso: row.curso,
                fecha_inicio_inscripcion: row.fechaInicioInscripcion,
                fecha_fin_inscripcion: row.fechaFinInscripcion,
                fecha_inicio_curso: row.fechaInicioCurso,
                fecha_fin_curso: row.fechaFinCurso,
                estado: row.CodEstado,
                es_publicada_portal_cc: row.publicaPCC === "1" ? "1" : "0"
            };

            (async () => {
                let res = await crearInstancia(instancia);
                console.log(res);
            })();
        });
    });

const crearInstancia = async (instancia) => {
    const { curso, fecha_inicio_inscripcion, fecha_fin_inscripcion, fecha_inicio_curso, fecha_fin_curso, estado, es_publicada_portal_cc } = instancia;

    try {
        const nuevaInstancia = await instanciaModel.create({
            curso,
            fecha_inicio_inscripcion,
            fecha_fin_inscripcion,
            fecha_inicio_curso,
            fecha_fin_curso,
            estado,
            es_publicada_portal_cc
        });
        console.log('Instancia creada:', nuevaInstancia);
        return nuevaInstancia;
    } catch (error) {
        console.error('Error al crear instancia:', error);
    }
};

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
