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
import AsistenciaRepository from '../core/repositories/AsistenciaRepository.js';
import AsistenciaService from '../core/services/AsistenciaService.js';

export default class RegistrarInscripcionesMasivasUseCase {

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
      const asistenciaRepository = new AsistenciaRepository();
      const asistenciaService = new AsistenciaService(asistenciaRepository);


      // 1. Parsear el archivo Excel
      const data = this.excelParserService.parse(fileBuffer);

      // 2. Gestionar Curso: Buscar si existe, si no, crearlo.
      let cursoExistente = await cursoService.obtenerCursoPorNombre(data.nombreCurso);

      if (!cursoExistente) {
        const cursoData = { nombreCurso: data.nombreCurso };
        cursoExistente = await cursoService.crearCurso(cursoData, transaction);
      }
      this.curso = cursoExistente;

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

      // 3. Crear Días de Evento (Carga Masiva)
      const diasEventoParaCrear = data.diasEvento.map(fecha => ({
        fecha: fecha,
        id_evento: this.evento.id
      }));

      if (diasEventoParaCrear.length > 0) {
        await diaEventoRepository.crearVarios(diasEventoParaCrear, transaction);
      }

      // 5. Gestionar Participantes (Carga Masiva)
      const cuilsParticipantes = data.participantes.map(p => p.cuil);
      const participantesExistentes = await participanteService.buscarParticipantesPorCuils(cuilsParticipantes);
      const cuilsExistentes = new Set(participantesExistentes.map(p => p.cuil));

      const participantesParaCrear = data.participantes.filter(p => !cuilsExistentes.has(p.cuil));

      if (participantesParaCrear.length > 0) {
        await participanteService.crearVarios(participantesParaCrear, transaction);
      }

      // 6. Crear Inscripciones (Carga Masiva)
      const inscripcionesParaCrear = data.participantes.map(participante => ({
        cuil: participante.cuil,
        id_evento: data.nroEvento,
      }));

      if (inscripcionesParaCrear.length > 0) {
        await inscripcionService.crearVarios(inscripcionesParaCrear, transaction);
      }

      // 7. Cargar Asistencias (Carga Masiva)
      const asistenciasParaCrear = [];
      data.diasEvento.forEach(dia => {
        data.participantes.forEach(participante => {
          asistenciasParaCrear.push({
            cuil: participante.cuil,
            id_evento: data.nroEvento,
            fecha: dia,
            estado_asistencia: 0 // Asumiendo un estado por defecto
          });
        });
      });


      if (asistenciasParaCrear.length > 0) {
        await asistenciaService.crearVarios(asistenciasParaCrear, transaction);
      }

      // Si todo fue exitoso, confirmar la transacción
      await transaction.commit();

      return {
        success: true,
        message: 'Archivo procesado exitosamente con carga masiva.',
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
