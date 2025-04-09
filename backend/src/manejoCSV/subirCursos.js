import express from "express";
import indexRoutes from "../routes/index.routes.js"
import inicializarPassport from "../config/passport.js"
import cors from "cors";
import sequelize from "../config/database.js";
import associateModels from "../models/asociateModelos.js";


import fs from 'fs';
import csv from 'csv-parser';


//import para postCurso
import cursoModel from "../models/curso.models.js";
import medioInscripcionModel from "../models/medioInscripcion.models.js";
import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import plataformaDictadoModel from "../models/plataformaDictado.models.js";
import areaModel from "../models/area.models.js";
import ministerio from "../models/ministerio.models.js";



const app = express();

// Inicialización de Sequelize
const initSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        // Sincronización de modelos
        //await sequelize.sync({ alter: true }); // Opciones como 'alter: true' pueden ser útiles para aplicaciones en desarrollo
        associateModels();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Llamada a la función para inicializar Sequelize
initSequelize();

app.use(cors());

const PORT = 4000

//MIdleware
app.use(express.json());
inicializarPassport();



app.use("/api", indexRoutes);

//midlaware para manejar errores
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message || "Error Interno" })
})

// Leer un archivo .CSV después de la sincronización de modelos
const results = [];
fs.createReadStream('./basededatos.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
        results.push(data); // Añadir cada fila de datos a results
    })
    .on('end', () => {
        //Variables del curso
        let cod = "";
        let nombre = "";
        let cupo = 1;
        let cantidad_horas = 1;
        let medio_inscripcion = "";
        let plataforma_dictado = "";
        let tipo_capacitacion = "";
        let area = "";
       
        // Procesar cada fila de resultados
        results.forEach(row => {

            
            // Reiniciar variables para cada fila
            cod = "";
            nombre = "";
            cupo = 1;
            cantidad_horas = 1;
            medio_inscripcion = "";
            plataforma_dictado = "";
            tipo_capacitacion = "";
            area = "";

            // Asignar valores según las claves específicas
            for (let key in row) {
                if (key === "Nombre corto") cod = row[key];
                if (key == "NombreCurso") nombre = row[key];
                if (key === "codMedioInscipcion") medio_inscripcion = row[key];
                if (key === "codPlataformaDicado") plataforma_dictado = row[key];
                if (key === "codTipoCapacitacion") tipo_capacitacion = row[key];
                if (key === "codArea") area = row[key];
            }

            // Mostrar los datos de cada curso en cada iteración
            //console.log({ cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area });

            (async()=>{
                let res = await crearCurso({ cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area });
                console.log(res)
            })()
        });
    });


const crearCurso = async (curso) => {
    try {

        const { cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area } = curso

        

        const existe = await cursoModel.findOne({ where: { cod: cod } });
        if (existe) throw new Error("El Código ya existe");
        if (cod.length > 15) throw new Error("El Código no es valido debe ser menor a 15 caracteres");
        if (cupo < 1 || isNaN(cupo)) throw new Error("El cupo debe ser mayor a 0");
        if (cantidad_horas < 1 || isNaN(cantidad_horas)) throw new Error("La cantidad de horas debe ser mayor a 0");
        if (medio_inscripcion.length > 15) throw new Error("El medio de inscripción no es valido debe ser menor a 15 caracteres");
        if (plataforma_dictado.length > 15) throw new Error("La plataforma de dictado no es valido debe ser menor a 15 caracteres");
        if (tipo_capacitacion.length > 15) throw new Error("El tipo de capacitación no es valido debe ser menor a 15 caracteres");
        if (area.length > 15) throw new Error("El area no es valido debe ser menor a 15 caracteres");
        if (nombre.length > 250) throw new Error("El nombre no es valido debe ser menor a 100 caracteres");
        if (nombre.length === 0) throw new Error("El nombre no puede ser vacío");

        const response = await cursoModel.create(curso);

        return true

    } catch (error) {
        return error
    }
}




app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
