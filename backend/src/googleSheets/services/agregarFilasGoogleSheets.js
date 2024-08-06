import {generarStringTutores} from "../utils/generarStringTutores.js";
import authorize from "../utils/getAuth.js";
import { appendRows } from "../utils/appendRow.js";
import { google } from 'googleapis';
export const agregarFilasGoogleSheets = async (newInstancias) => {
    try {
       
        
        //Genera nueva fila para agreagr a google sheets
        const {ministerio, area, medio_inscripcion, plataforma_dictado, tipo_capacitacion, cupo, horas, curso, estado, cohortes, tutores, codCurso} = newInstancias;

       
        //Obtiene autorización
        const auth = authorize
        const googleSheets = google.sheets({ version: 'v4', auth });

        const stringTutores = generarStringTutores(tutores);



        for (let i = 0; i < cohortes.length; i++) {

            let rowNew = [ministerio, area, codCurso, curso, cohortes[i].fechaInscripcionDesde, cohortes[i].fechaInscripcionHasta, cohortes[i].fechaCursadaDesde, cohortes[i].fechaCursadaHasta, medio_inscripcion, plataforma_dictado, tipo_capacitacion, cupo, horas, stringTutores] 
            const metaData = await appendRows(googleSheets, "principal", "B", "O", rowNew)
            if (!metaData) {
                throw new Error('Error al insertar la nueva fila: Fila vacía');
            }
        }

       

        return true
        
    } catch (error) {
        throw error
    }
}
