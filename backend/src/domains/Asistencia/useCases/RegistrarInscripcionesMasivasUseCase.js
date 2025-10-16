import ExcelParserService from '../services/ExcelParserService.js';
import CursoService from '../core/services/CursoService.js';
import CursoRepository from '../core/repositories/CursoRepository.js';
import sequelize from '../../../config/database.js';
import ParticipanteService from '../core/services/ParticipanteService.js';
import ParticipanteRepository from '../core/repositories/ParticipanteRepository.js';
import EventoService from '../core/services/EventoService.js';
import EventoRepository from '../core/repositories/EventoRepository.js';
import CidiService from '../../../services/CidiService.js';
import DiaEventoRepository from '../core/repositories/DiaEventoRepository.js';
import InscripcionService from '../core/services/InscripcionService.js';
import InscripcionRepository from '../core/repositories/InscipcionRepository.js';

class RegistrarInscripcionesMasivasUseCase {

  constructor() {
    this.excelParserService = new ExcelParserService();
    this.evento = false;
    this.curso = false;
  }

  async execute(fileBuffer) {
    const transaction = await sequelize.transaction();

    try {
      // Instanciamos los servicios y repositorios con sus dependencias
      const cursoRepository = new CursoRepository();
      const cursoService = new CursoService(cursoRepository);
      const eventoRepository = new EventoRepository();
      const eventoService = new EventoService(eventoRepository);
      const diaEventoRepository = new DiaEventoRepository();
      const participanteRepository = new ParticipanteRepository();
      const participanteService = new ParticipanteService(participanteRepository);
      const inscripcionRepository = new InscripcionRepository();
      const inscripcionService = new InscripcionService(inscripcionRepository);
      const cidiService = new CidiService();

      // 1. Parsear el archivo Excel
      const data = this.excelParserService.parse(fileBuffer);

      // 2. Gestionar Curso: Buscar si existe, si no, crearlo.
      let cursoExistente = await cursoService.obtenerCursoPorNombre(data.nombreCurso);

      if (!cursoExistente) {
        const cursoData = { nombreCurso: data.nombreCurso };
        cursoExistente = await cursoService.crearCurso(cursoData, transaction);
      }
      this.curso = cursoExistente;

      // Aquí podrías asociar `diasEventoIds` al evento si tu modelo lo requiere.
      
      // 4. Crear Evento
      const eventoData = {
        id: data.nroEvento, // Asumiendo que este es el ID que quieres forzar
        id_curso: this.curso.id, // Usar el ID del curso
        fecha_desde: data.fechaDesde,
        fecha_hasta: data.fechaHasta,
        comentario_horario: data.horario,
        nombre_apellido_docente: data.nombreDocente,
        capacidad: 100, // TODO: Ajustar a lo que se recibe por front
        sala: "Test", // TODO: Ajustar a lo que se recibe por front
      };
      
      const nuevoEvento = await eventoService.crearEvento(eventoData, transaction);
      this.evento = nuevoEvento;
      
      // 3. Crear Días de Evento
      
      for (let i = 0; i < data.diasEvento.length; i++) {
        const nuevoDiaEvento = await diaEventoRepository.crear({fecha: data.diasEvento[i], id_evento: this.evento.id}, transaction);
       // data.diasEvento[i].id = nuevoDiaEvento.id;
        
      }
      // 5. Gestionar Participantes e Inscripciones
      for (let i = 0; i < data.participantes.length; i++) {
        let participanteExistente = await participanteService.buscarParticipantePorCuil(data.participantes[i].cuil);

        if (!participanteExistente) {
          participanteExistente = await participanteService.crearParticipante(data.participantes[i], transaction);
        }

        // 6. Crear la inscripción
        const inscripcionData = {
          cuil: data.participantes[i].cuil,
          id_evento: data.nroEvento,
          // otros campos de inscripción si son necesarios
        };
        await inscripcionService.crear(inscripcionData, transaction);
      }

      // Si todo fue exitoso, confirmar la transacción
      await transaction.commit();
      
      return {
        success: true,
        message: 'Archivo procesado exitosamente.',
        data: data
      };
    } catch (error) {
      // Si algo falla, revertir todos los cambios
      await transaction.rollback();

      console.error('Error procesando el archivo:', error);
      return {
        success: false,
        message: 'Ocurrió un error al procesar el archivo.',
        error: error.message
      };
    }
  }

}

export default RegistrarInscripcionesMasivasUseCase;
