import { putCurso } from "./cursos.service.js";

export const deleteRow = async (row, option) => {
    console.log("ROWS:", {
        cod: row.cod,
        nombre: row.nombre,
        cupo: row.cupo,
        cantidad_horas: row.horas,
        medio_inscripcion: row.codMedioInscripcion,
        plataforma_dictado: row.codPlataformaDictado,
        tipo_capacitacion: row.codTipoCapacitacion,
        area: row.area
    })
    try {
        switch (option) {
            case 'Cursos':
                //cupo debe ser un entero
                if (!Number.isInteger(Number(row.cupo))) throw new Error("El cupo debe ser un entero");
                if (!Number.isInteger(Number(row.horas))) throw new Error("La cantidad de horas debe ser un entero");
                await putCurso({
                    cod: row.cod,
                    nombre: row.nombre,
                    cupo: row.cupo,
                    cantidad_horas: row.horas,
                    medio_inscripcion: row.codMedioInscripcion,
                    plataforma_dictado: row.codPlataformaDictado,
                    tipo_capacitacion: row.codTipoCapacitacion,
                    area: row.codArea
                })
                break;
            case "Ministerios":
                break;
            case "Áreas":
                break
            case "Personas":
                break
            case "Tutores":
                break
            case "Medios de Inscripción":
                break
            case "Plataformas de Dictado":
                break
            case "Usuarios":
                break

            default:
                break;
        }

    } catch (error) {
        throw error
    }
}

