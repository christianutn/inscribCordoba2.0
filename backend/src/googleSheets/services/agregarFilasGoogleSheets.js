import {generarStringTutores} from "../utils/generarStringTutores.js";
import authorize from "../utils/getAuth.js";
import { appendRows } from "../utils/appendRow.js";
import { google } from 'googleapis';
export const agregarFilasGoogleSheets = async (newInstancias) => {
    try {
       
        
        //Genera nueva fila para agreagr a google sheets
        const {ministerio, area, medio_inscripcion, plataforma_dictado, tipo_capacitacion, cupo, horas, curso, estado, cohortes, tutores, codCurso, opciones, comentario, cadenaSolicitud} = newInstancias;

       
        //Obtiene autorización
        const auth = authorize
        const googleSheets = google.sheets({ version: 'v4', auth });

        const stringTutores = generarStringTutores(tutores);



        for (let i = 0; i < cohortes.length; i++) {
            console.log(cohortes[i].fechaInscripcionDesde, cohortes[i].fechaInscripcionHasta, cohortes[i].fechaCursadaDesde, cohortes[i].fechaCursadaHasta);
            let rowNew = [
                ministerio, 
                area, 
                codCurso, 
                curso, 
                cohortes[i].fechaInscripcionDesde, 
                cohortes[i].fechaInscripcionHasta, 
                cohortes[i].fechaCursadaDesde, 
                cohortes[i].fechaCursadaHasta, 
                medio_inscripcion, 
                plataforma_dictado, 
                tipo_capacitacion, 
                cupo, 
                horas, 
                stringTutores, 
                opciones.autogestionado ? "Si" : "No", 
                opciones.edad ? "Si" : "No", 
                opciones.departamento ? "Si" : "No", 
                opciones.publicaPCC ? "Si" : "No",
                opciones.correlatividad ? "Si" : "No",
                opciones.esNuevoEvento ? "Si" : "No",
                comentario,
                cadenaSolicitud
            ] 
            const metaData = await appendRows(googleSheets, "principal", "B", "W", rowNew)
            if (!metaData) {
                throw new Error('Error al insertar la nueva fila: Fila vacía');
            }
        }

       

        return true
        
    } catch (error) {
        throw error
    }
}
