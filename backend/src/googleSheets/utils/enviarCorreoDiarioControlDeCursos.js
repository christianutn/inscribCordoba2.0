import cron from "node-cron";
import envioCorreo from "../../utils/enviarCorreo.js"; // Asegúrate que esta ruta es correcta
import Instancia from "../../models/instancia.models.js";
import Curso from "../../models/curso.models.js";




const enviarCorreoDiarioContolDeCursos =  () => {
    cron.schedule('0 0 8 * * * *', async () => { // Añadido async
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] CRON TAREA: Iniciando revisión de cursos para alerta de 5 o 6 días.`);
    
        try {
            // 1. Obtener los cursos
            const cursosARevisar = await Instancia.findAll();
            
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
    
    
    
            console.log(`[${timestamp}] CRON TAREA: Fecha Actual (normalizada): ${fechaActual.toISOString().split('T')[0]}`);
            console.log(`[${timestamp}] CRON TAREA: Fecha Objetivo (+5 días): ${fechaObjetivo5Dias.toISOString().split('T')[0]}`);
    
    
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
                    if (fechaInicioCurso.getTime() === fechaObjetivo5Dias.getTime()) {
                        coursesFoundCount++;
                        console.log(`[${timestamp}] CRON TAREA: ¡COINCIDENCIA! Curso "${nombreCurso}" (${codigoCurso}) inicia en 5 días (${fechaInicioCursoStr}).`);
    
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
    
    
                const htmlEmailBody = `<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Alerta de Cursos Próximos (5 días)</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f8f8f8;
        }
        .container {
          background-color: #ffffff;
          padding: 25px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: 700px;
          margin: 20px auto;
        }
        .alert-box {
          background-color: #eaf4ff;
          border-left: 6px solid #007BFF;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .alert-box h3 {
          margin-top: 0;
          font-size: 1.2em;
          color: #0056b3;
        }
        .alert-icon {
          font-size: 1.5em;
          margin-right: 8px;
          vertical-align: middle;
        }
        .alert-box ul {
          margin-top: 5px;
          padding-left: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th, td {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 10px;
          font-size: 0.95em;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        h2 {
          color: #333333;
          border-bottom: 2px solid #eee;
          padding-bottom: 8px;
          margin-top: 0;
        }
        .footer {
          margin-top: 25px;
          font-size: 0.9em;
          color: #777777;
          text-align: center;
        }
        @media (max-width: 600px) {
          th, td { padding: 8px; font-size: 0.9em; }
          .container { padding: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Cursos a controlar</h2>
    
        <div class="alert-box">
          <h3><span class="alert-icon">⚠️</span> Atención</h3>
          <p>
            Los siguientes cursos están programados para comenzar dentro de los próximos <strong>5 días</strong> 
            (fecha de inicio: <strong>${fechaObjetivoStr5}</strong>). Es necesario revisar cada uno para asegurarse de que:
          </p>
          <ul>
            <li>Estén correctamente maquetados.</li>
            <li>Las fechas de los exámenes estén actualizadas.</li>
            <li>Revisar que estén las instancias creadas y configuradas correctamente.</li>
          </ul>
          <p>En caso de detectar inconsistencias o problemas, por favor contactarse con los responsables correspondientes para su corrección.</p>
    
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
        </div>
    
        <p class="footer">
          Este es un correo automático generado el ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'full', timeStyle: 'long' })}.
        </p>
      </div>
    </body>
    </html>
    `;
    
                const emailSubject = `Alerta: ${coursesFoundCount} Curso${coursesFoundCount > 1 ? 's' : ''} inicia${coursesFoundCount > 1 ? 'n' : ''} en 5 días (${fechaObjetivoStr5} )`;
    
                //Toma la lista de correos del .env sino por defecto manda a soporte
                const emailRecipients = "soportecampuscordoba@gmail.com"; // Update default if needed
    
                if (!emailRecipients) {
                    console.error(`[${timestamp}] CRON TAREA: No se configuraron destinatarios de correo (la variable de entorno EMAIL_RECIPIENTS está vacía). No se puede enviar el correo.`);
                    return; // Don't proceed if no recipients
                }
    
                await envioCorreo(htmlEmailBody, emailSubject, emailRecipients);
                console.log(`[${timestamp}] CRON TAREA: Correo enviado exitosamente a: ${emailRecipients}`);
            } else {
                console.log(`[${timestamp}] CRON TAREA: No se encontraron cursos que inicien en 5 o 6 días (${fechaObjetivo5Dias.toISOString().split('T')[0]} ). No se envió correo.`);
            }
        } catch (error) {
            console.error(`[${timestamp}] CRON TAREA: Error general durante la ejecución:`, error);
        }
    
    }, {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires"
    });
}



export default enviarCorreoDiarioContolDeCursos;