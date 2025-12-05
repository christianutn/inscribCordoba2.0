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
import Rol from "./rol.models.js";
import Usuario from "./usuario.models.js";
import Tutor from "./tutor.models.js";
import TipoRolTutor from "./tipoRolTutor.models.js";
import AreasAsignadasUsuario from "./areasAsignadasUsuario.models.js";
import TipoCertificacion from "./tipoCertificacion.models.js";
import AreaTematica from "./areaTematica.models.js";
import Evento from "./evento.models.js";
import Perfil from "./perfil.models.js";
import RestriccionesPorCorrelatividad from "./restricciones_por_correlatividad.models.js";
import RestriccionesPorDepartamento from "./restricciones_por_departamento.models.js";
import Departamento from "./departamentos.models.js"
import NotasAutorizacion from './notas_autorizacion.models.js';
import Autorizador from "./autorizador.models.js";
import Coordinadores from "./coordinadores.models.js";
import Estados_notas_autorizacion from './estado_nota_autorizacion.models.js';
import Cambios_estados_notas_autorizacion from './cambios_estados_notas_autorizacion.models.js';
import RolTutor from './roles_tutor.models.js'
import Historico_tutores_en_curso from './historico_tutores_en_curso.models.js';

const associateInscribModels = () => {

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

    // Relaciones para Autorizador
    Autorizador.belongsTo(Persona, { foreignKey: 'cuil', targetKey: 'cuil', as: 'detalle_persona' });
    Autorizador.belongsTo(Area, { foreignKey: 'area', as: 'detalle_area' });

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
    Evento.belongsTo(Usuario, { foreignKey: 'usuario', as: 'detalle_usuario' });
    Evento.belongsTo(Curso, { foreignKey: 'curso', as: 'detalle_curso' });

    RestriccionesPorCorrelatividad.belongsTo(Curso, { foreignKey: 'curso', as: 'detalle_curso' });
    RestriccionesPorCorrelatividad.belongsTo(Curso, { foreignKey: 'curso_correlativo', as: 'detalle_curso_correlativo' });

    RestriccionesPorDepartamento.belongsTo(Departamento, { foreignKey: "departamento_id", as: 'detalle_departamento' })

    // Asociaciones NotasAutorización
    NotasAutorizacion.belongsTo(Autorizador, { foreignKey: 'autorizador_cuil', as: 'detalle_autorizador' });
    NotasAutorizacion.belongsTo(Usuario, { foreignKey: 'usuario_cuil', as: 'detalle_usuario' });


    // Asociaciones Coordinadores
    Coordinadores.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_persona' });
    Coordinadores.belongsTo(NotasAutorizacion, { foreignKey: 'nota_autorizacion_id', as: 'detalle_nota_autorizacion' });

    Persona.hasMany(Coordinadores, { foreignKey: 'cuil' });
    NotasAutorizacion.hasMany(Coordinadores, { foreignKey: 'nota_autorizacion_id' });

    Cambios_estados_notas_autorizacion.belongsTo(NotasAutorizacion, {
        foreignKey: 'nota_autorizacion_id',
        targetKey: 'id',
        as: 'NotaAutorizacion' // Opcional: un alias para evitar conflictos y claridad
    });

    // Un cambio de estado pertenece a un Estado de Nota de Autorización
    Cambios_estados_notas_autorizacion.belongsTo(Estados_notas_autorizacion, {
        foreignKey: 'estado_nota_autorizacion_cod',
        targetKey: 'cod',
        as: 'Estado' // Opcional: un alias para evitar conflictos y claridad
    });

    // Un Estado de Nota de Autorización puede aparecer en muchos cambios de estado
    Estados_notas_autorizacion.hasMany(Cambios_estados_notas_autorizacion, {
        foreignKey: 'estado_nota_autorizacion_cod',
        sourceKey: 'cod',
        as: 'CambiosAsociados'
    });



    // Un registro histórico pertenece a un Curso
    Historico_tutores_en_curso.belongsTo(Curso, {
        foreignKey: 'curso_cod',
        targetKey: 'cod',
        as: 'detalle_curso'
    });

    // Un registro histórico pertenece a un Tutor
    Historico_tutores_en_curso.belongsTo(Tutor, {
        foreignKey: 'tutor_cuil',
        targetKey: 'cuil',
        as: 'TutorHistorico'
    });

    // Un registro histórico pertenece a un Rol de Tutor
    Historico_tutores_en_curso.belongsTo(RolTutor, {
        foreignKey: 'rol_tutor_cod',
        targetKey: 'cod',
        as: 'detalle_rol_tutor'
    });

    // Un registro historico puede tener o no una nota de autorizacion asignada

    Historico_tutores_en_curso.belongsTo(NotasAutorizacion, {
        foreignKey: 'nota_de_autorizacion_id',
        targetKey: 'id',
        as: 'detalle_nota_de_autorizacion'
    });

    Historico_tutores_en_curso.belongsTo(Persona, {
        foreignKey: 'tutor_cuil',
        targetKey: 'cuil',
        as: 'detalle_persona'
    });

    Historico_tutores_en_curso.belongsTo(Usuario, {
        foreignKey: 'usuario_cuil',
        targetKey: 'cuil',
        as: 'detalle_usuario'
    });
};

export default associateInscribModels;
