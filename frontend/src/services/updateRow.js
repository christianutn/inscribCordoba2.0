import { putCurso } from "./cursos.service.js";
import { putPersona } from "./personas.service.js"
import { putArea } from "./areas.service.js"
import { putMinisterios } from "./ministerios.service.js"
import { putTutores } from "./tutores.service.js"
import { putMedioInscripcion } from "./mediosInscripcion.service.js"
import { putPlataformaDictado } from "./plataformasDictado.service.js"
import { putUsuarios } from "./usuarios.service.js"
import { putTiposCapacitacion } from "./tiposCapacitacion.service.js"


export const updateRow = async (row, option) => {
    console.log("ROWS:", {
        cod: row.areaOriginal,
        nombre: row.nombre,
        ministerio: row.codMinisterio,
        newCod: row.codArea
    })
    try {
        switch (option) {
            case 'Cursos':
                //cupo debe ser un entero
                if (!Number.isInteger(Number(row.cupo))) throw new Error("El cupo debe ser un entero")
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
                await putMinisterios({
                    cod: row.id,
                    nombre: row.nombre,
                    newCod: row.cod
                })
                break;
            case "Áreas":
                await putArea({
                    cod: row.id,
                    nombre: row.nombre,
                    ministerio: row.codMinisterio,
                    newCod: row.cod
                })
                break
            case "Personas":
                await putPersona({
                    cuil: row.id,
                    nombre: row.nombre,
                    apellido: row.apellido,
                    mail: row.mail || "",
                    celular: row.celular,
                    newCuil: row.cuil
                })
                break
            case "Tutores":

                await putTutores({
                    cuil: row.id,
                    nombre: row.nombre,
                    apellido: row.apellido,
                    mail: row.mail || "",
                    celular: row.celular,
                    newCuil: row.cuil,
                    area: row.codArea,
                    esReferente: row.esReferente
                })

                break
            case "Medios de Inscripción":

                await putMedioInscripcion({
                    cod: row.id,
                    nombre: row.nombre,
                    newCod: row.cod

                })
                break
            case "Plataformas de Dictado":

                await putPlataformaDictado({
                    cod: row.id,
                    nombre: row.nombre,
                    newCod: row.cod

                })
                break
            case "Usuarios":
                await putUsuarios({
                    cuil: row.id,
                    nombre: row.nombre,
                    apellido: row.apellido,
                    mail: row.mail || "",
                    celular: row.celular,
                    newCuil: row.cuil,
                    area: row.codArea,
                    rol: row.codRol

                })
                break
            case "Tipos de Capacitación":
            

                await putTiposCapacitacion({
                    cod: row.id,
                    nombre: row.nombre,
                    newCod: row.cod

                })
                break

            default:
                break;
        }

    } catch (error) {
        console.log(error)
        throw error
    }
}

