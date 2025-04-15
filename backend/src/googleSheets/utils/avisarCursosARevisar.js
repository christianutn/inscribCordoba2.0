import authorize from './getAuth.js';
import { google } from 'googleapis';
import { getDataRange } from './getDataRange.js';

const avisarCursosARevisar = async () => {
  try {
    // Authorizar Google
    const auth = authorize;
    const googleSheets = google.sheets({ version: 'v4', auth });

    // Obtener datos de la hoja "principal" y rango "A:AF"
    const data = await getDataRange(googleSheets, auth, "principal", "A:AF");

    // Convertir a objetos con clave-valor usando la cabecera
    const headers = data[0];
    const rows = data.slice(1);
    const transformedData = rows.map(row => {
      return headers.reduce((acc, header, index) => {
        acc[header] = row[index];
        return acc;
      }, {});
    });

    // Calcular la fecha 6 días después de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaObjetivo = new Date(hoy);
    fechaObjetivo.setDate(hoy.getDate() + 6);

    // Formatear a 'YYYY-MM-DD'
    const fechaObjetivoStr = fechaObjetivo.toISOString().slice(0, 10);
    console.log("Buscando cursos con fecha:", fechaObjetivoStr);

    // Filtrar cursos
    const cursosARevisar = transformedData.filter(obj => {
      const fechaInicioRaw = obj['Fecha inicio del curso'];

      // Asegurarse de que hay fecha válida
      if (!fechaInicioRaw) return false;

      const fechaInicio = new Date(fechaInicioRaw);
      const fechaInicioStr = fechaInicio.toISOString().slice(0, 10);

      return (
        fechaInicioStr === fechaObjetivoStr &&
        obj['Estado'] !== 'SUSPENDIDO' &&
        obj['Estado'] !== 'CANCELADO'
      );
    });

    console.log("Cursos a revisar:", cursosARevisar);

    return cursosARevisar;


  } catch (error) {
    console.error("Error al obtener datos de Google Sheets:", error);
    throw error;
  }
};

avisarCursosARevisar();

export default avisarCursosARevisar;
