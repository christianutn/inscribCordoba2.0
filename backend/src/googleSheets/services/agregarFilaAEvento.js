
/*
import authorize from "../utils/getAuth.js";
import { appendRows } from "../utils/appendRow.js";
import { google } from 'googleapis';
import Persona from "../../models/persona.models.js";
import Curso from "../../models/curso.models.js";
import Perfil from "../../models/perfil.models.js";
import AreaTematica from "../../models/areaTematica.models.js";
import TipoCertificacion from "../../models/tipoCertificacion.models.js";
import Area from "../../models/area.models.js";
import Ministerio from "../../models/ministerio.models.js";
import tipoCapacitacion from "../../models/tipoCapacitacion.models.js";

export const agregarFilasNuevoEvento= async (nuevoEvento, cuil) => {
    try {


        //Genera nueva fila para agreagr a google sheets
        const { curso, perfil, area_tematica, tipo_certificacion, presentacion, objetivos, requisitos_aprobacion, ejes_tematicos, certifica_en_cc, disenio_a_cargo_cc } = nuevoEvento;


        //Obtiene autorización
        const auth = authorize
        const googleSheets = google.sheets({ version: 'v4', auth });

        // Obtener datos del usuario
        const usuario = await Persona.findOne({ where: { cuil } });
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Obtener datos del curso
        const cursoSeleccionado = await Curso.findOne({ where: { cod: curso } });
        if (!cursoSeleccionado) {
            throw new Error('Curso no encontrado');
        }

        // Obtener datos del área
        const areaSeleccionada = await Area.findOne({ where: { cod: cursoSeleccionado.area } });
        if (!areaSeleccionada) {
            throw new Error('Área no encontrada');
        }

        // Obtener datos del ministerio
        const ministerioSeleccionado = await Ministerio.findOne({ where: { cod: areaSeleccionada.ministerio } });
        if (!ministerioSeleccionado) {
            throw new Error('Ministerio no encontrado');
        }
       
        // Obtener datos del perfil
        const perfilSeleccionado = await Perfil.findOne({ where: { cod: perfil } });
        if (!perfilSeleccionado) {
            throw new Error('Perfil no encontrado');
        }

        // Obtener datos del área temática
        const areaTematicaSeleccionada = await AreaTematica.findOne({ where: { cod: area_tematica } });
        if (!areaTematicaSeleccionada) {
            throw new Error('Área temática no encontrada');
        }

        // Obtener datos del tipo de certificación
        const tipoCertificacionSeleccionado = await TipoCertificacion.findOne({ where: { cod: tipo_certificacion } });
        if (!tipoCertificacionSeleccionado) {
            throw new Error('Tipo de certificación no encontrado');
        }

        // Obtener datos del tipo de capacitación
        const tipoCapacitacionSeleccionado = await tipoCapacitacion.findOne({ where: { cod: cursoSeleccionado.tipo_capacitacion } });
        if (!tipoCapacitacionSeleccionado) {
            throw new Error('Tipo de capacitación no encontrado');
        }

        // Calcular fecha y hora actual
        const fechaActual = new Date();
       
        // concatenar con nombre y apellido del usuario
        const datosDeSolicitud = `${usuario?.apellido || ''} ${usuario?.nombre || ''} - ${fechaActual.toString()}`;

        let rowNew = [
            ministerioSeleccionado?.nombre || null,
            areaSeleccionada?.nombre || null,
            curso,
            cursoSeleccionado?.nombre || null,
            tipoCapacitacionSeleccionado?.nombre || null,
            perfilSeleccionado?.descripcion || null,
            areaTematicaSeleccionada?.descripcion || null,
            presentacion,
            objetivos,
            ejes_tematicos,
            requisitos_aprobacion,
            usuario?.apellido || null,   
            usuario?.nombre || null,  
            usuario?.cuil || null,   
            tipoCertificacionSeleccionado?.descripcion || null,  
            disenio_a_cargo_cc == 1 ? 'Sí' : 'No',    
            certifica_en_cc == 1 ? 'Sí' : 'No',   
            datosDeSolicitud,       
        ]
        const metaData = await appendRows(googleSheets, "eventos", "A", "R", rowNew);
        if (!metaData) {
            throw new Error('Error al insertar la nueva fila: Fila vacía');
        }

        return true

    } catch (error) {
        throw error
    }
}
*/