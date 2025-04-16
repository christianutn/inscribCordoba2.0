// import express from "express";
// import indexRoutes from "./routes/index.routes.js";
// import inicializarPassport from "../src/config/passport.js"; // Asegúrate que esta ruta es correcta
// import cors from "cors";
// import sequelize from "./config/database.js";
// import associateModels from "./models/asociateModelos.js";
// import 'dotenv/config';
// import cron from "node-cron";
// import envioCorreo from "./utils/enviarCorreo.js"; // Asegúrate que esta ruta es correcta
// import obtenerCursosARevisar from "./googleSheets/utils/obtenerCursosARevisar.js"; // Asegúrate que esta ruta es correcta

// const app = express();

// // Inicialización de Sequelize
// const initSequelize = async () => {
//     try {
//         await sequelize.authenticate();
//         console.log('Connection to the database has been established successfully.');
//         associateModels();
//         console.log('All models were synchronized successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// };

// // Llamada a la función para inicializar Sequelize
// initSequelize();

// app.use(cors());

// const PORT = 4001; //Recordar cambiar a puerto 4000 al subir cambios

// // Middleware
// app.use(express.json());
// inicializarPassport();

// app.use("/api", indexRoutes);

// // Endpoint de prueba
// app.get("/api/ping", (req, res) => {
//     const responseData = {
//         message: "El backend está escuchando.",
//         timestamp: new Date().toISOString(),
//         method: req.method,
//         url: req.originalUrl,
//         headers: req.headers,
//     };
//     res.status(200).json(responseData);
// });

// // Middleware para manejar rutas no encontradas
// app.use((req, res, next) => {
//     const error = new Error(`Ruta ${req.originalUrl} no encontrada`);
//     error.status = 404;
//     next(error);
// });

// // Middleware para manejar errores generales
// app.use((err, req, res, next) => {
//     console.log("INFO ERROR: ", {
//         message: err.message || err,
//         url: req.originalUrl,
//         method: req.method,
//         status: err.statusCode || 500
//     });
//     res.status(err.statusCode || 500).json({ message: err.message || "Error Interno" });
// });


// // --- Programación de la Tarea Cron ---

// // Expresión Cron: '0 * * * * *' -> Cada minuto (¡SOLO PARA PRUEBAS!)
// // Cambiar a '0 24 17 * * *' (o lo deseado) para producción (Ej: 17:24 hs Argentina)
// // Zona Horaria: America/Argentina/Buenos_Aires
// cron.schedule('0 * * * * *', async () => { // Añadido async
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] CRON TAREA: Iniciando revisión de cursos para alerta de 5 o 6 días.`); // Modificado

//     try {
//         // 1. Obtener los cursos (dentro del cron para datos actualizados)
//         const cursosARevisar = await obtenerCursosARevisar();
//         console.log(`[${timestamp}] CRON TAREA: Se obtuvieron ${cursosARevisar ? cursosARevisar.length : 0} cursos.`);

//         if (!Array.isArray(cursosARevisar) || cursosARevisar.length === 0) {
//             console.log(`[${timestamp}] CRON TAREA: No hay cursos válidos para revisar o la obtención falló. No se enviará correo.`);
//             return;
//         }

//         // 2. Calcular fechas
//         const fechaActual = new Date();
//         fechaActual.setHours(0, 0, 0, 0); // Normalizar a medianoche local

//         const fechaObjetivo5Dias = new Date(fechaActual); // Fecha +5 días
//         fechaObjetivo5Dias.setDate(fechaActual.getDate() + 5);

//         const fechaObjetivo6Dias = new Date(fechaActual); // Fecha +6 días
//         fechaObjetivo6Dias.setDate(fechaActual.getDate() + 6);

//         console.log(`[${timestamp}] CRON TAREA: Fecha Actual (normalizada): ${fechaActual.toISOString().split('T')[0]}`);
//         console.log(`[${timestamp}] CRON TAREA: Fecha Objetivo (+5 días): ${fechaObjetivo5Dias.toISOString().split('T')[0]}`); // Log +5
//         console.log(`[${timestamp}] CRON TAREA: Fecha Objetivo (+6 días): ${fechaObjetivo6Dias.toISOString().split('T')[0]}`); // Log +6

//         let tableRowsHtml = '';
//         let coursesFoundCount = 0;

//         cursosARevisar.forEach(curso => {
//             if (!curso || typeof curso !== 'object') {
//                 console.warn(`[${timestamp}] CRON TAREA: Elemento inválido encontrado en la lista de cursos.`);
//                 return;
//             }

//             const fechaInicioCursoStr = curso['Fecha inicio del curso'];
//             const nombreCurso = curso['Nombre del curso'] || 'Nombre no disponible';
//             const codigoCurso = curso['Código del curso'] || 'Código no disponible';

//             if (!fechaInicioCursoStr) {
//                 return;
//             }

//             try {
//                 if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicioCursoStr)) {
//                     console.warn(`[${timestamp}] CRON TAREA: Formato de fecha inválido ('${fechaInicioCursoStr}') en curso: "${nombreCurso}" (${codigoCurso})`);
//                     return;
//                 }

//                 const [year, month, day] = fechaInicioCursoStr.split('-').map(Number);
//                 const fechaInicioCurso = new Date(year, month - 1, day);
//                 fechaInicioCurso.setHours(0, 0, 0, 0);

//                 if (isNaN(fechaInicioCurso.getTime())) {
//                     console.warn(`[${timestamp}] CRON TAREA: Fecha inválida ('${fechaInicioCursoStr}') tras conversión en curso: "${nombreCurso}" (${codigoCurso})`);
//                     return;
//                 }

//                 // --- MODIFICACIÓN CLAVE: Comparar con +5 O +6 días ---
//                 if (fechaInicioCurso.getTime() === fechaObjetivo5Dias.getTime() || fechaInicioCurso.getTime() === fechaObjetivo6Dias.getTime()) {
//                     coursesFoundCount++;
//                     console.log(`[${timestamp}] CRON TAREA: ¡COINCIDENCIA! Curso "${nombreCurso}" (${codigoCurso}) inicia en 5 o 6 días (${fechaInicioCursoStr}).`);

//                     tableRowsHtml += `
//                         <tr>
//                             <td>${codigoCurso.replace(/</g, "<").replace(/>/g, ">")}</td>
//                             <td>${nombreCurso.replace(/</g, "<").replace(/>/g, ">")}</td>
//                             <td>${fechaInicioCursoStr}</td>
//                         </tr>
//                     `;
//                 }
//             } catch (error) {
//                 console.error(`[${timestamp}] CRON TAREA: Error procesando fecha '${fechaInicioCursoStr}' para curso "${nombreCurso}" (${codigoCurso}):`, error);
//             }
//         });

//         if (coursesFoundCount > 0) {
//             console.log(`[${timestamp}] CRON TAREA: Se encontraron ${coursesFoundCount} cursos que inician en 5 o 6 días. Construyendo y enviando correo.`);

//             const fechaObjetivoStr5 = fechaObjetivo5Dias.toLocaleDateString('es-AR', {
//                 day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires'
//             });
//             const fechaObjetivoStr6 = fechaObjetivo6Dias.toLocaleDateString('es-AR', {
//                 day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires'
//             });

//             const htmlEmailBody = `
//             <!DOCTYPE html>
//             <html lang="es">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Alerta de Cursos Próximos (5-6 días)</title> <!-- Modificado título -->
//                 <style>
//                     body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; }
//                     table { width: 100%; border-collapse: collapse; margin-top: 15px; }
//                     th, td { border: 1px solid #dddddd; text-align: left; padding: 10px; }
//                     th { background-color: #f2f2f2; font-weight: bold; }
//                     h2 { color: #333333; border-bottom: 1px solid #eeeeee; padding-bottom: 5px; }
//                     h3 { color: #555555; font-weight: normal; }
//                     .footer { margin-top: 25px; font-size: 0.9em; color: #777777; }
//                 </style>
//             </head>
//             <body>
//                 <h2>Cursos a controlar</h2>
//                 <!-- Modificado h3 para incluir ambas fechas -->
//                 <h3>El siguiente listado de cursos debe ser controlado ya que comienzan dentro de los próximos 5 o 6 días (el ${fechaObjetivoStr5} o el ${fechaObjetivoStr6}):</h3>
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Nombre corto</th>
//                             <th>Curso</th>
//                             <th>Fecha inicio</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${tableRowsHtml}
//                     </tbody>
//                 </table>
//                 <p class="footer">
//                     Este es un correo automático generado el ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'full', timeStyle: 'long' })}.
//                 </p>
//             </body>
//             </html>
//             `;

//             const emailSubject = `Alerta: ${coursesFoundCount} Curso${coursesFoundCount > 1 ? 's' : ''} inicia${coursesFoundCount > 1 ? 'n' : ''} en 5 o 6 días (${fechaObjetivoStr5} o ${fechaObjetivoStr6})`;
//             const emailRecipient = process.env.EMAIL_RECIPIENT || "soportecampuscordoba@gmail.com";

//             await envioCorreo(htmlEmailBody, emailSubject, emailRecipient);
//             console.log(`[${timestamp}] CRON TAREA: Correo enviado exitosamente a ${emailRecipient}.`);

//         } else {
//             console.log(`[${timestamp}] CRON TAREA: No se encontraron cursos que inicien en 5 o 6 días (${fechaObjetivo5Dias.toISOString().split('T')[0]} o ${fechaObjetivo6Dias.toISOString().split('T')[0]}). No se envió correo.`);
//         }

//     } catch (error) {
//         console.error(`[${timestamp}] CRON TAREA: Error general durante la ejecución:`, error);
//     }

// }, {
//     scheduled: true,
//     timezone: "America/Argentina/Buenos_Aires"
// });

// // --- Fin Programación de la Tarea Cron ---

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import indexRoutes from "./routes/index.routes.js";
import inicializarPassport from "../src/config/passport.js"; // Asegúrate que esta ruta es correcta
import cors from "cors";
import sequelize from "./config/database.js";
import associateModels from "./models/asociateModelos.js";
import 'dotenv/config';
import cron from "node-cron";
import envioCorreo from "./utils/enviarCorreo.js"; // Asegúrate que esta ruta es correcta
import obtenerCursosARevisar from "./googleSheets/utils/obtenerCursosARevisar.js"; // Asegúrate que esta ruta es correcta

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

const PORT = 4001; //Recordar cambiar a puerto 4000 al subir cambios

// Middleware
app.use(express.json());
inicializarPassport();

app.use("/api", indexRoutes);

// Endpoint de prueba
app.get("/api/ping", (req, res) => {
    const responseData = {
        message: "El backend está escuchando.",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
    };
    res.status(200).json(responseData);
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
    const error = new Error(`Ruta ${req.originalUrl} no encontrada`);
    error.status = 404;
    next(error);
});

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
    console.log("INFO ERROR: ", {
        message: err.message || err,
        url: req.originalUrl,
        method: req.method,
        status: err.statusCode || 500
    });
    res.status(err.statusCode || 500).json({ message: err.message || "Error Interno" });
});


// --- Programación de la Tarea Cron ---

// Expresión Cron: '0 * * * * *' -> Cada minuto (¡SOLO PARA PRUEBAS!)
// Cambiar a '0 24 17 * * *' (o lo deseado) para producción (Ej: 17:24 hs Argentina)
// Zona Horaria: America/Argentina/Buenos_Aires
cron.schedule('0 * * * * *', async () => { // Añadido async
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] CRON TAREA: Iniciando revisión de cursos para alerta de 5 o 6 días.`);

    try {
        // 1. Obtener los cursos
        const cursosARevisar = await obtenerCursosARevisar();
        console.log(`[${timestamp}] CRON TAREA: Se obtuvieron ${cursosARevisar ? cursosARevisar.length : 0} cursos.`);

        if (!Array.isArray(cursosARevisar) || cursosARevisar.length === 0) {
            console.log(`[${timestamp}] CRON TAREA: No hay cursos válidos para revisar o la obtención falló. No se enviará correo.`);
            return;
        }

        // 2. Calcular fechas
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);

        const fechaObjetivo5Dias = new Date(fechaActual);
        fechaObjetivo5Dias.setDate(fechaActual.getDate() + 5);

        const fechaObjetivo6Dias = new Date(fechaActual);
        fechaObjetivo6Dias.setDate(fechaActual.getDate() + 6);

        console.log(`[${timestamp}] CRON TAREA: Fecha Actual (normalizada): ${fechaActual.toISOString().split('T')[0]}`);
        console.log(`[${timestamp}] CRON TAREA: Fecha Objetivo (+5 días): ${fechaObjetivo5Dias.toISOString().split('T')[0]}`);
        console.log(`[${timestamp}] CRON TAREA: Fecha Objetivo (+6 días): ${fechaObjetivo6Dias.toISOString().split('T')[0]}`);

        let tableRowsHtml = '';
        let coursesFoundCount = 0;

        cursosARevisar.forEach(curso => {
            if (!curso || typeof curso !== 'object') {
                console.warn(`[${timestamp}] CRON TAREA: Elemento inválido encontrado en la lista de cursos.`);
                return;
            }

            const fechaInicioCursoStr = curso['Fecha inicio del curso'];
            const nombreCurso = curso['Nombre del curso'] || 'Nombre no disponible';
            const codigoCurso = curso['Código del curso'] || 'Código no disponible';

            if (!fechaInicioCursoStr) {
                // console.warn(`[${timestamp}] CRON TAREA: Fecha de inicio ausente en curso: "${nombreCurso}" (${codigoCurso})`); // Optional: Log missing dates
                return; // Skip if no date
            }

            try {
                // Basic validation for YYYY-MM-DD format
                if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicioCursoStr)) {
                    console.warn(`[${timestamp}] CRON TAREA: Formato de fecha inválido ('${fechaInicioCursoStr}') en curso: "${nombreCurso}" (${codigoCurso})`);
                    return; // Skip invalid formats
                }

                // Parse the date string
                const [year, month, day] = fechaInicioCursoStr.split('-').map(Number);
                // IMPORTANT: Month is 0-indexed in JavaScript Date constructor (0 = January)
                const fechaInicioCurso = new Date(year, month - 1, day);
                fechaInicioCurso.setHours(0, 0, 0, 0); // Normalize to midnight for comparison

                // Check if the date conversion was successful
                if (isNaN(fechaInicioCurso.getTime())) {
                    console.warn(`[${timestamp}] CRON TAREA: Fecha inválida ('${fechaInicioCursoStr}') tras conversión en curso: "${nombreCurso}" (${codigoCurso})`);
                    return; // Skip if date is invalid after parsing
                }

                // --- MODIFICACIÓN CLAVE: Comparar con +5 O +6 días ---
                if (fechaInicioCurso.getTime() === fechaObjetivo5Dias.getTime() || fechaInicioCurso.getTime() === fechaObjetivo6Dias.getTime()) {
                    coursesFoundCount++;
                    console.log(`[${timestamp}] CRON TAREA: ¡COINCIDENCIA! Curso "${nombreCurso}" (${codigoCurso}) inicia en 5 o 6 días (${fechaInicioCursoStr}).`);

                    // Sanitize potentially malicious HTML input from sheet data
                    const escapeHtml = (unsafe) => {
                        if (typeof unsafe !== 'string') return '';
                        return unsafe
                            .replace(/&/g, "&")
                            .replace(/</g, "<")
                            .replace(/>/g, ">")
                            .replace(/"/g, "")
                            .replace(/'/g, "'");
                    }

                    tableRowsHtml += `
                        <tr>
                            <td>${escapeHtml(codigoCurso)}</td>
                            <td>${escapeHtml(nombreCurso)}</td>
                            <td>${escapeHtml(fechaInicioCursoStr)}</td>
                        </tr>
                    `;
                }
            } catch (error) {
                console.error(`[${timestamp}] CRON TAREA: Error procesando fecha '${fechaInicioCursoStr}' para curso "${nombreCurso}" (${codigoCurso}):`, error);
                // Continue to the next curso even if one fails
            }
        }); // End forEach loop

        if (coursesFoundCount > 0) {
            console.log(`[${timestamp}] CRON TAREA: Se encontraron ${coursesFoundCount} cursos que inician en 5 o 6 días. Construyendo y enviando correo.`);

            const fechaObjetivoStr5 = fechaObjetivo5Dias.toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires'
            });
            const fechaObjetivoStr6 = fechaObjetivo6Dias.toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires'
            });

            const htmlEmailBody = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Alerta de Cursos Próximos (5-6 días)</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f8f8; }
                    .container { background-color: #ffffff; padding: 25px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 700px; margin: 20px auto; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #dddddd; text-align: left; padding: 10px; font-size: 0.95em; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    h2 { color: #333333; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 0; }
                    h3 { color: #555555; font-weight: 600; font-size: 1.1em; }
                    .footer { margin-top: 25px; font-size: 0.9em; color: #777777; text-align: center; }
                    @media (max-width: 600px) {
                      th, td { padding: 8px; font-size: 0.9em; }
                      .container { padding: 15px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Cursos a controlar</h2>
                    <h3>El siguiente listado de cursos debe ser controlados ya que comienzan dentro de los próximos 5 o 6 días (el ${fechaObjetivoStr5} o el ${fechaObjetivoStr6}), en caso de encontrar errores (Falta de maquetación, actualización de fechas, etc.), comunicarse con los responsables de los cursos:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre corto</th>
                                <th>Curso</th>
                                <th>Fecha inicio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                    <p class="footer">
                        Este es un correo automático generado el ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'full', timeStyle: 'long' })}.
                    </p>
                </div>
            </body>
            </html>
            `;

            const emailSubject = `Alerta: ${coursesFoundCount} Curso${coursesFoundCount > 1 ? 's' : ''} inicia${coursesFoundCount > 1 ? 'n' : ''} en 5 o 6 días (${fechaObjetivoStr5} o ${fechaObjetivoStr6})`;

            //Toma la lista de correos del .env sino por defecto manda a soporte
            const emailRecipients = process.env.EMAIL_RECIPIENTS || "soportecampuscordoba@gmail.com"; // Update default if needed

            if (!emailRecipients) {
                console.error(`[${timestamp}] CRON TAREA: No se configuraron destinatarios de correo (la variable de entorno EMAIL_RECIPIENTS está vacía). No se puede enviar el correo.`);
                return; // Don't proceed if no recipients
            }

            await envioCorreo(htmlEmailBody, emailSubject, emailRecipients);
            console.log(`[${timestamp}] CRON TAREA: Correo enviado exitosamente a: ${emailRecipients}`);
        } else {
            console.log(`[${timestamp}] CRON TAREA: No se encontraron cursos que inicien en 5 o 6 días (${fechaObjetivo5Dias.toISOString().split('T')[0]} o ${fechaObjetivo6Dias.toISOString().split('T')[0]}). No se envió correo.`);
        }
    } catch (error) {
        console.error(`[${timestamp}] CRON TAREA: Error general durante la ejecución:`, error);
    }

}, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires"
});

// --- Fin Programación de la Tarea Cron ---

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));