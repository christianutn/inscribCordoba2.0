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
const associateModels = () => {
    Ministerio.hasMany(Area, { foreignKey: 'ministerio', as: 'detalle_areas' });
    Area.belongsTo(Ministerio, { foreignKey: 'ministerio', as: 'detalle_ministerio' });
  

    Curso.belongsTo(MedioInscripcion, { foreignKey: 'medio_inscripcion', as: 'detalle_medioInscripcion' });
    Curso.belongsTo(TipoCapacitacion, { foreignKey: 'tipo_capacitacion', as: 'detalle_tipoCapacitacion' });
    Curso.belongsTo(PlataformaDictado, { foreignKey: 'plataforma_dictado', as: 'detalle_plataformaDictado' });
    Curso.belongsTo(Area, { foreignKey: 'area', as: 'detalle_area' });

    //Intancia
    Instancia.belongsTo(Curso, { foreignKey: 'curso', as: 'detalle_curso' });
    Instancia.belongsTo(Estado, { foreignKey: 'estado', as: 'detalle_estado' });
    

    //TutoresXInstancia
    TutoresXInstancia.belongsTo(Curso, { foreignKey: 'curso', as: 'detalle_curso' });
    TutoresXInstancia.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_tutor' });

};

export default associateModels;


