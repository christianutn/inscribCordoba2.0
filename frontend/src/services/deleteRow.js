import { deleteCurso } from "./cursos.service.js";
import {deleteMinisterio} from "./ministerios.service.js";
import {deleteArea} from "./areas.service.js";
import {deletePersona} from "./personas.service.js";
import {deleteTutor} from "./tutores.service.js";
import {deleteMedioInscripcion} from "./mediosInscripcion.service.js";
import {deletePlataformaDictado} from "./plataformasDictado.service.js";
import {deleteUsuario} from "./usuarios.service.js"


export const deleteRow = async (identificador, option) => {

    try {
        switch (option) {
            case 'Cursos':
                await deleteCurso(identificador);
            
                break;
            case "Ministerios":
                await deleteMinisterio(identificador);
                break;
            case "Áreas":
                await deleteArea(identificador);
                break
            case "Personas":
                await deletePersona(identificador);
                break
            case "Tutores":
                await deleteTutor(identificador);
                break
            case "Medios de Inscripción":
                await deleteMedioInscripcion(identificador);
                break
            case "Plataformas de Dictado":
                await deletePlataformaDictado(identificador);
                break
            case "Usuarios":
                await deleteUsuario(identificador);
                break

            default:
                break;
        }

    } catch (error) {
        throw error
    }
}

