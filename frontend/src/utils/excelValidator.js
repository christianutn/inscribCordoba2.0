
import * as XLSX from 'xlsx';

/**
 * Valida si un archivo de planilla de asistencia cumple con el formato esperado.
 * Verificaciones:
 * 1. Celdas obligatorias en la cabecera (C4, C5, C7, C8).
 * 2. Fechas válidas.
 * 3. Filas de fechas (Fila 9) y formato de participantes (desde fila 10).
 * 
 * @param {File} file - El archivo Excel subido por el usuario.
 * @returns {Promise<boolean>} - True si es válido, lanza error si no.
 */
export const validateAttendanceExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                if (!worksheet) {
                    reject(new Error('El archivo no contiene ninguna hoja de cálculo.'));
                    return;
                }

                // 1. Validar Cabecera (Campos requeridos por backend)
                // C4: Nro Evento, C5: Nombre Curso, C7: Fecha Desde, C8: Fecha Hasta
                const requiredCells = [
                    { cell: 'C4', name: 'Nro de Evento' },
                    { cell: 'C5', name: 'Nombre del Curso' },
                    { cell: 'C7', name: 'Fecha Desde' },
                    { cell: 'C8', name: 'Fecha Hasta' }
                ];

                for (const { cell, name } of requiredCells) {
                    if (!worksheet[cell] || !worksheet[cell].v) {
                        reject(new Error(`Falta el dato obligatorio "${name}" en la celda ${cell}.`));
                        return;
                    }
                }

                // 2. Validar Fechas del evento
                // Deben ser números (formato de fecha de Excel)
                const fechaDesdeCell = worksheet['C7'];
                const fechaHastaCell = worksheet['C8'];

                // Excel dates are typically numbers (days since 1900)
                // Check if type is number
                if (typeof fechaDesdeCell.v !== 'number' || typeof fechaHastaCell.v !== 'number') {
                    // Try to handle string dates if possible, or reject strict
                    if (isNaN(Date.parse(fechaDesdeCell.v)) || isNaN(Date.parse(fechaHastaCell.v))) {
                        reject(new Error('El formato de las fechas en C7 o C8 no es válido.'));
                        return;
                    }
                }

                // 3. Validar Estructura de Participantes
                // Se espera que los participantes comiencen en la fila 10 (base 1) -> RowIndex 10

                // Obtenemos el rango útil de la hoja para no iterar infinitamente ni cortar antes de tiempo
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                // range.e.r es el índice (0-based) de la última fila con datos
                const lastRowWithData = range.e.r + 1; // Convertir a 1-based para consistencia con rowIndex

                let hasParticipants = false;
                let rowIndex = 10;
                let emptyRowFound = false; // Flag para detectar huecos

                // Iteramos hasta la última fila reportada por Excel como parte del rango usado
                while (rowIndex <= lastRowWithData) {
                    const cellB = worksheet[`B${rowIndex}`];
                    const cellC = worksheet[`C${rowIndex}`];

                    const cuilRaw = cellB ? cellB.v : null;
                    const nombreRaw = cellC ? cellC.v : null;

                    // Verificamos si la fila parece vacía (Sin CUIL y Sin Nombre)
                    const isRowEmpty = !cuilRaw && !nombreRaw;

                    if (isRowEmpty) {
                        emptyRowFound = true;
                        rowIndex++;
                        continue;
                    }

                    // Si encontramos datos después de una fila vacía, es un error de formato (hueco)
                    if (emptyRowFound) {
                        // Pero cuidado, puede ser que haya filas "vacías" al final del rango que Excel considera "usado" por formato.
                        // Solo es error si encontramos DATOS después de vacío.
                        reject(new Error(`Se encontró una fila vacía (Fila ${rowIndex - 1}) antes del final de la lista. No deje filas vacías entre los participantes.`));
                        return;
                    }

                    // --- Validación de Fila con Datos ---

                    // 1. Validar que B no esté vacía si hay datos en la fila
                    // Si estamos aquí, isRowEmpty es false, así que o B o C tienen algo.
                    if (!cuilRaw) {
                        reject(new Error(`Falta el CUIL en la fila ${rowIndex}.`));
                        return;
                    }

                    // 2. Validar Formato CUIL (11 dígitos)
                    const cuilClean = String(cuilRaw).replace(/\D/g, '');
                    if (cuilClean.length !== 11) {
                        reject(new Error(`El CUIL en la fila ${rowIndex} no es válido. Debe contener 11 dígitos numéricos. Valor: "${cuilRaw}"`));
                        return;
                    }

                    // 3. Validar Nombre (Columna C)
                    if (!nombreRaw) {
                        reject(new Error(`Falta el nombre para el participante en la fila ${rowIndex}.`));
                        return;
                    }
                    if (!nombreRaw.includes(',')) {
                        reject(new Error(`El nombre en la fila ${rowIndex} debe tener el formato "Apellido, Nombres" (separado por coma). Valor: "${nombreRaw}"`));
                        return;
                    }

                    const [apellido, nombre] = nombreRaw.split(',');
                    if (!apellido || !apellido.trim() || !nombre || !nombre.trim()) {
                        reject(new Error(`El nombre en la fila ${rowIndex} está incompleto. Debe tener "Apellido, Nombres". Valor: "${nombreRaw}"`));
                        return;
                    }

                    hasParticipants = true;
                    rowIndex++;
                }

                if (!hasParticipants) {
                    // Warning: No valid participants found
                }

                resolve(true);

            } catch (error) {
                reject(new Error('Error al leer el archivo Excel: ' + error.message));
            }
        };

        reader.onerror = (error) => {
            reject(new Error('Error de lectura del archivo.'));
        };

        reader.readAsArrayBuffer(file);
    });
};
