import Area from "./area.models.js";
import Ministerio from "./ministerio.models.js";
import TutoresXInstancia from "./tutorXInstancia.models.js"
import Instancia from "./instancia.models.js";
import Persona from "./persona.models.js";
import Curso from "./curso.models.js";
import MedioInscripcion from "./medioInscripcion.models.js";
import TipoCapacitacion from "./tipoCapacitacion.models.js";
import PlataformaDictado from "./plataformaDictado.models.js";
import EstadoInstancia from "./estado_instancia.models.js";
import Autorizador from "./autorizador.models.js";
import Rol from "./rol.models.js";
import Usuario from "./usuario.models.js";
import Tutor from "./tutor.models.js";
import TipoRolTutor from "./tipoRolTutor.models.js";
import AreasAsignadasUsuario from "./areasAsignadasUsuario.models.js";
import TipoCertificacion from "./tipoCertificacion.models.js";
import AreaTematica from "./areaTematica.models.js";
import Evento from "./evento.models.js";
import Perfil from "./perfil.models.js";
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
    Instancia.belongsTo(EstadoInstancia, { foreignKey: 'estado_instancia', as: 'detalle_estado_instancia' });
    Instancia.belongsTo(MedioInscripcion, { foreignKey: 'medio_inscripcion', as: 'detalle_medioInscripcion' });
    Instancia.belongsTo(TipoCapacitacion, { foreignKey: 'tipo_capacitacion', as: 'detalle_tipoCapacitacion' });
    Instancia.belongsTo(PlataformaDictado, { foreignKey: 'plataforma_dictado', as: 'detalle_plataformaDictado' });
    Instancia.belongsTo(Usuario, { foreignKey: 'asignado', as: 'detalle_asignado' });


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
    
    // Areas Asignadas Usuario
   
    AreasAsignadasUsuario.belongsTo(Usuario, { 
        foreignKey: 'usuario',
        targetKey: 'cuil',
        as: 'detalle_usuario' 
    });
    AreasAsignadasUsuario.belongsTo(Area, { 
        foreignKey: 'area',
        targetKey: 'cod',
        as: 'detalle_area' 
    });

    //Tutor
    Tutor.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_persona' });
    Tutor.belongsTo(Area, { foreignKey: 'area', as: 'detalle_area' });



    

    // Asociar al modelo Evento los modelos de AreaTematica, TipoCertificacion y Perfil
    Evento.belongsTo(AreaTematica, { foreignKey: 'area_tematica', as: 'detalle_areaTematica' });
    Evento.belongsTo(TipoCertificacion, { foreignKey: 'tipo_certificacion', as: 'detalle_tipoCertificacion' });
    Evento.belongsTo(Perfil, { foreignKey: 'perfil', as: 'detalle_perfil' });

};

export default associateModels;


