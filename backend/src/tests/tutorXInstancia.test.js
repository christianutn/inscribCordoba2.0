import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import TutorXInstancia from '../models/tutorXInstancia.models.js';


// --- MOCK DE AUTENTICACIÓN ---
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        // Por defecto, usa un ADM, pero los tests pueden sobreescribir req.user
        if (!req.user) {
            req.user = { user: { cuil: '20378513376', nombre: 'Admin', rol: 'ADM' } };
        }
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));


describe('Rutas de Tutores (con Auth Mockeada)', () => {

    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        token_adm = 'mocked-auth-token';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET ---
    describe('GET /api/tutoresXInstancias', () => {
        it('debe devolver todos los tutores para un rol ADM', async () => {
            const mockTutores = [{
                cuil: "27331627947",
                curso: "C-AAEA",
                fecha_inicio_curso: "2025-02-25",
                detalle_tutor: {
                    cuil: "27331627947",
                    nombre: "Paula Belen",
                    apellido: "Takaya",
                    mail: "educacionsuperiorenadicciones@gmail.com",
                    celular: null
                },
                detalle_instancia: {
                    curso: "C-AAEA",
                    fecha_inicio_curso: "2025-02-25",
                    fecha_fin_curso: "2025-03-10",
                    fecha_inicio_inscripcion: "2025-02-13",
                    fecha_fin_inscripcion: "2025-02-24",
                    es_publicada_portal_cc: true,
                    cupo: 100,
                    cantidad_horas: 10,
                    es_autogestionado: 1,
                    tiene_correlatividad: 0,
                    tiene_restriccion_edad: 0,
                    tiene_restriccion_departamento: 0,
                    datos_solictud: null,
                    estado_instancia: "PEND",
                    medio_inscripcion: "PCC",
                    plataforma_dictado: "CC",
                    tipo_capacitacion: "EL",
                    comentario: "Test",
                    asignado: "20111111111",
                    detalle_curso: {
                        cod: "C-AAEA",
                        nombre: "Consecuencias del consumo de alcohol durante el embarazo",
                        cupo: 500,
                        cantidad_horas: 11,
                        medio_inscripcion: "PCC",
                        plataforma_dictado: "CC",
                        tipo_capacitacion: "EL",
                        area: "SPAA",
                        esVigente: 1,
                        tiene_evento_creado: 1,
                        es_autogestionado: null,
                        tiene_restriccion_edad: null,
                        tiene_restriccion_departamento: null,
                        publica_pcc: null,
                        tiene_correlatividad: null,
                        numero_evento: null,
                        esta_maquetado: null,
                        esta_configurado: null,
                        aplica_sincronizacion_certificados: null,
                        url_curso: null,
                        detalle_area: {
                            cod: "SPAA",
                            nombre: "Secretaría de Prevención y Asistencia de las Adicciones",
                            ministerio: "MS",
                            esVigente: 1,
                            detalle_ministerio: {
                                cod: "MS",
                                nombre: "Ministerio de Salud",
                                esVigente: 1
                            }
                        }
                    }
                }
            }];

            jest.spyOn(TutorXInstancia, 'findAll').mockResolvedValue(mockTutores);

            const res = await request(app).get('/api/tutoresXInstancias').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockTutores);
        });

        it('debe devolver error por falta de datos para un rol ADM', async () => {

            jest.spyOn(TutorXInstancia, 'findAll').mockResolvedValue([]);

            const res = await request(app).get('/api/tutoresXInstancias').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
        });

        

    });


});