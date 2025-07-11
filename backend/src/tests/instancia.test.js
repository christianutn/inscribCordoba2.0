import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import instanciaModel from '../models/instancia.models.js';
import Persona from '../models/persona.models.js';
import TutoresXInstancia from '../models/tutorXInstancia.models.js';
import { QueryTypes } from 'sequelize';

// Mockeamos passport para saltarnos la autenticación real en todos los tests
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        // Hacemos el mock flexible para que pueda ser modificado en cada test
        if (!req.user) { // Si un test no define un usuario, usamos el ADM por defecto
            req.user = {
                user: {
                    cuil: '20378513376',
                    nombre: 'Usuario',
                    apellido: 'Mockeado',
                    rol: 'ADM'
                }
            };
        }
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));
// Mock de middleware para que simplemente dejen pasar la petición
jest.mock('../middlewares/validations/instancia.validations.js', () => jest.fn((req, res, next) => next()));
jest.mock('../utils/manejarValidacionErrores.js', () => jest.fn((req, res, next) => next()));


describe('Rutas de Instancias (/api/instancias)', () => {

    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        token_adm = 'mocked-auth-token';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET / ---
    describe('GET /', () => {
        it('debe devolver todas las instancias si existen', async () => {
            const mockInstancias = [{ curso: 'C-001', fecha_inicio_curso: '2025-08-01' }];
            jest.spyOn(instanciaModel, 'findAll').mockResolvedValue(mockInstancias);

            const res = await request(app).get('/api/instancias').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockInstancias);
        });

        it('debe devolver un error 404 si no existen instancias', async () => {
            jest.spyOn(instanciaModel, 'findAll').mockResolvedValue([]);
            const res = await request(app).get('/api/instancias').set('Authorization', `Bearer ${token_adm}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No existen instancias');
        });
    });

    // --- TESTS PARA POST / ---
    describe('POST /', () => {
        const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
        const bodyData = {
            curso: 'C-NEW',
            cupo: 50,
            cantidad_horas: 10,
            opciones: { publicaPCC: true },
            cohortes: [{ fechaCursadaDesde: '2025-09-01' }],
            tutores: [{ cuil: '20222222222' }],
            comentario: "Test"
        };

        beforeEach(() => {
            mockTransaction.commit.mockClear();
            mockTransaction.rollback.mockClear();
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);
        });

        it('debe crear una instancia y tutores y hacer commit', async () => {
            jest.spyOn(instanciaModel, 'findOne').mockResolvedValue(null); // Instancia no existe
            jest.spyOn(instanciaModel, 'create').mockResolvedValue({});
            jest.spyOn(Persona, 'findOne').mockResolvedValue({ cuil: '20222222222' }); // Tutor sí existe
            jest.spyOn(TutoresXInstancia, 'create').mockResolvedValue({});

            const res = await request(app).post('/api/instancias').set('Authorization', `Bearer ${token_adm}`).send(bodyData);

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe("Instancias y tutores creados exitosamente");
            expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
        });

        it('debe hacer rollback si la instancia ya existe', async () => {
            jest.spyOn(instanciaModel, 'findOne').mockResolvedValue({ curso: 'C-NEW' }); // Instancia SÍ existe

            const res = await request(app).post('/api/instancias').set('Authorization', `Bearer ${token_adm}`).send(bodyData);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Ya existe una instancia con el mismo curso y fecha de cursada');
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
        });

        it('debe hacer rollback si un tutor no existe', async () => {
            jest.spyOn(instanciaModel, 'findOne').mockResolvedValue(null);
            jest.spyOn(Persona, 'findOne').mockResolvedValue(null); // Tutor NO existe

            const res = await request(app).post('/api/instancias').set('Authorization', `Bearer ${token_adm}`).send(bodyData);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toContain('El tutor con CUIL 20222222222 no existe');
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    // --- TESTS PARA DELETE / ---
    describe('DELETE /', () => {
        it('debe eliminar una instancia si existe', async () => {
            const mockDestroy = jest.fn().mockResolvedValue(1);
            jest.spyOn(instanciaModel, 'findOne').mockResolvedValue({ destroy: mockDestroy });

            const res = await request(app).delete('/api/instancias').set('Authorization', `Bearer ${token_adm}`).send({ curso: 'C-001', fecha_inicio_curso: '2025-01-01' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Instancia eliminada");
            expect(mockDestroy).toHaveBeenCalledTimes(1);
        });

        it('debe devolver 404 si la instancia a eliminar no existe', async () => {
            jest.spyOn(instanciaModel, 'findOne').mockResolvedValue(null);
            const res = await request(app).delete('/api/instancias').set('Authorization', `Bearer ${token_adm}`).send({ curso: 'C-001', fecha_inicio_curso: '2025-01-01' });
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("La instancia no existe");
        });
    });
    
    // --- TESTS PARA GET /get-fechas-invalidas/:targetYear ---
    describe('GET /get-fechas-invalidas/:targetYear', () => {
        it('debe devolver un array de fechas inválidas basado en la query SQL', async () => {
            const mockFechasInvalidas = [{ calendario_fecha: '2025-02-15', motivo_invalidez: 'Mes bloqueado' }];
            jest.spyOn(instanciaModel, 'findOne').mockResolvedValue({ maxFecha: '2025-01-01' });
            jest.spyOn(sequelize, 'query').mockResolvedValue(mockFechasInvalidas);

            const res = await request(app).get('/api/instancias/get-fechas-invalidas/2025').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockFechasInvalidas);
            expect(sequelize.query).toHaveBeenCalledWith(expect.any(String), {
                replacements: { target_year: "2025" },
                type: QueryTypes.SELECT
            });
        });
    });
    
    // --- TESTS PARA PUT /:curso_params/:fecha_inicio_curso_params ---
    describe('PUT /:curso_params/:fecha_inicio_curso_params', () => {
        const curso = 'C-TEST';
        const fecha = '2025-10-10';
        const updateData = { cupo: 150, comentario: "Actualizado" };

        it('debe actualizar una instancia correctamente', async () => {
            jest.spyOn(instanciaModel, 'update').mockResolvedValue([1]); // 1 fila afectada

            const res = await request(app).put(`/api/instancias/${curso}/${fecha}`).set('Authorization', `Bearer ${token_adm}`).send(updateData);
            
            expect(res.statusCode).toBe(200);
            expect(instanciaModel.update).toHaveBeenCalledWith(
                updateData,
                { where: { curso: curso, fecha_inicio_curso: fecha } }
            );
        });

        it('debe devolver un error si la actualización falla', async () => {
            const dbError = new Error("Error en la base de datos");
            jest.spyOn(instanciaModel, 'update').mockRejectedValue(dbError);

            const res = await request(app).put(`/api/instancias/${curso}/${fecha}`).set('Authorization', `Bearer ${token_adm}`).send(updateData);
            
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Error al actualizar la instancia");
        });
    });
});