import Area from "./area.models.js";
import Ministerio from "./ministerio.models.js";
import TutoresXInstancia from "./tutorXInstancia.models.js"
import Instancia from "./instancia.models.js";
import Persona from "./persona.models.js";
import Curso from "./curso.models.js";
import MedioInscripcion from "./medioInscripcion.models.js";
import TipoCapacitacion from "./tipoCapacitacion.models.js";
import PlataformaDictado from "./plataformaDictado.models.js";
import Estado from "./estado.models.js";
import Autorizador from "./autorizador.models.js";
import Rol from "./rol.models.js";
import Usuario from "./usuario.models.js";
import Tutor from "./tutor.models.js";
import TipoRolTutor from "./tipoRolTutor.models.js";
import CategoriaChatbot from "./categoriaChatbot.models.js";
import DiccionarioChatbot from "./diccionarioChatbot.models.js";
const associateModels = () => {
    Ministerio.hasMany(Area, { foreignKey: 'ministerio', as: 'detalle_areas' });
    Area.belongsTo(Ministerio, { foreignKey: 'ministerio', as: 'detalle_ministerio' });
    Area.hasMany(Curso, { foreignKey: 'area', as: 'detalle_cursos' });


    Curso.belongsTo(MedioInscripcion, { foreignKey: 'medio_inscripcion', as: 'detalle_medioInscripcion' });
    Curso.belongsTo(TipoCapacitacion, { foreignKey: 'tipo_capacitacion', as: 'detalle_tipoCapacitacion' });
    Curso.belongsTo(PlataformaDictado, { foreignKey: 'plataforma_dictado', as: 'detalle_plataformaDictado' });
    Curso.belongsTo(Area, { foreignKey: 'area', as: 'detalle_area' });

    //Intancia
    Instancia.belongsTo(Curso, { foreignKey: 'curso', as: 'detalle_curso' });
    Instancia.belongsTo(Estado, { foreignKey: 'estado', as: 'detalle_estado' });
   


    // TutoresXInstancia
    TutoresXInstancia.belongsTo(Instancia, { foreignKey: 'curso', as: 'detalle_instancia' });
    TutoresXInstancia.belongsTo(Instancia, { foreignKey: 'fecha_inicio_curso', as: 'instancia_fecha_inicio' });
    TutoresXInstancia.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_tutor' });

    //Autorizador
    Autorizador.belongsTo(Curso, { foreignKey: 'curso', as: 'detalle_curso' });
    Autorizador.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_persona' });

    //Usuarios
    Usuario.belongsTo(Rol, { foreignKey: 'rol', as: 'detalle_rol' });
    Usuario.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_persona' });
    Usuario.belongsTo(Area, { foreignKey: 'area', as: 'detalle_area' });


    //Tutor
    Tutor.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_persona' });
    Tutor.belongsTo(Area, { foreignKey: 'area', as: 'detalle_area' });



    // Cuando llame a DiccionarioChatbot debo poder acceder a todos los atributos de CategoriaChatbot
    DiccionarioChatbot.belongsTo(CategoriaChatbot, { foreignKey: 'idCategoria', as: 'detalle_categoria' });



};

export default associateModels;


