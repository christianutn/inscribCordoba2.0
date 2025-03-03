import { getDataRange } from "../utils/getDataRange.js";
import authorize from "../utils/getAuth.js";
import { google } from 'googleapis';

// Cachear instancia de Google Sheets (optimización clave)
let googleSheetsInstance = null;

export const getCronograma = async (areaAFiltrar) => {
    try {
        

        // Singleton para la instancia de Google Sheets
        if (!googleSheetsInstance) {
            const auth = authorize;
            googleSheetsInstance = google.sheets({ version: 'v4', auth });
        }

        // Obtener datos
        const data = await getDataRange(googleSheetsInstance, null, "principal", "B:AC");
        
        // Validación temprana (Early Return Pattern)
        if (!data?.length) return [];

        // Destructuración optimizada
        const [cabecera, ...filas] = data;

        // Caso "todos" manejado primero
        if (areaAFiltrar === "todos") return data;

        // Preprocesar condición de filtro
        const filtro = Array.isArray(areaAFiltrar) 
            ? new Set(areaAFiltrar)  // Convertir a Set para O(1)
            : areaAFiltrar;

        // Filtrar en una sola operación
        const filasFiltradas = filas.filter(row => 
            filtro instanceof Set 
                ? filtro.has(row[1])
                : row[1] === filtro
        );

        // Devolver estructura consistente
        return filasFiltradas.length ? [cabecera, ...filasFiltradas] : [cabecera];
        
    } catch (error) {
        console.error(`Error crítico: ${error.message}`);
        throw new Error("Falló la obtención del cronograma");
    }
};