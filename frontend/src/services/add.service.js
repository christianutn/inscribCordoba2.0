
import { deleteCurso } from "./cursos.service.js";
import { deleteMinisterio } from "./ministerios.service.js";
import { deleteArea } from "./areas.service.js";
import { deletePersona } from "./personas.service.js";
import { deleteTutor } from "./tutores.service.js";
import { deleteMedioInscripcion } from "./mediosInscripcion.service.js";
import { deletePlataformaDictado } from "./plataformasDictado.service.js";
import { deleteUsuario } from "./usuarios.service.js"

export const add = async (option, data) => {
    try {
        switch (option) {
            case 'Cursos':
                

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


