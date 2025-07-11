import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import Ministerio from '../models/ministerio.models.js';
// Importamos los otros modelos que el controlador utiliza para poder mockearlos.
import AreasAsignadasUsuario from '../models/areasAsignadasUsuario.models.js';
import Area from '../models/area.models.js';
import Curso from '../models/curso.models.js';
import Usuario from '../models/usuario.models.js';
import { Op } from 'sequelize';

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

// Mockeamos el parser para que el test de PUT no dependa de él
jest.mock('../utils/parseEsVigente.js', () => jest.fn(val => val));

describe('Rutas de Ministerios (con Auth Mockeada)', () => {
    
    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        token_adm = 'mocked-auth-token';
    });
    
    // Antes de cada test, restauramos todos los mocks para asegurar un entorno limpio.
    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET /api/ministerios ---
    // (Este bloque ya lo tenías correcto y se mantiene)
    describe('GET /api/ministerios', () => {
        it('debe devolver todos los ministerios si el rol es ADM', async () => {
            const mockMinisterios = [{ cod: 'MIN01', nombre: 'Ministerio de Prueba' }];
            const findAllSpy = jest.spyOn(Ministerio, 'findAll').mockResolvedValue(mockMinisterios);

            const res = await request(app)
                .get('/api/ministerios')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockMinisterios);
        });

    });
    
    // --- TESTS PARA POST /api/ministerios ---
    describe('POST /api/ministerios', () => {
        it('debe crear un nuevo ministerio y devolverlo con status 200', async () => {
            const newData = { cod: "MIN_NEW", nombre: "Ministerio de Innovación" };
            const createSpy = jest.spyOn(Ministerio, 'create').mockResolvedValue(newData);

            const res = await request(app)
                .post('/api/ministerios')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(newData);

            expect(res.statusCode).toBe(200); // Tu controlador devuelve 200
            expect(res.body).toEqual(newData);
            expect(createSpy).toHaveBeenCalledWith(newData);
        });

        it('debe devolver un error 400 si el nombre está vacío', async () => {
            const invalidData = { cod: "MIN_FAIL", nombre: "" };
            const res = await request(app)
                .post('/api/ministerios')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(invalidData);
            
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("El nombre no es valido");
        });
    });

    // --- TESTS PARA PUT /api/ministerios ---
    describe('PUT /api/ministerios', () => {
        it('debe actualizar un ministerio y devolver un mensaje de éxito', async () => {
            const updateData = { cod: 'MIN_OLD', nombre: 'Ministerio Actualizado', newCod: 'MIN_NEW', esVigente: 1 };
            
            // Mockeamos la transacción y los métodos del modelo
            const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);
            jest.spyOn(Ministerio, 'findOne').mockResolvedValue({ toJSON: () => updateData });
            jest.spyOn(Ministerio, 'update').mockResolvedValue([1]);

            const res = await request(app)
                .put('/api/ministerios')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Ministerio actualizado correctamente");
            expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
        });

        it('debe hacer rollback si no se encuentra el ministerio a actualizar', async () => {
            const updateData = { cod: 'NO_EXISTE', nombre: 'Ministerio Fantasma' };
            const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);
            jest.spyOn(Ministerio, 'findOne').mockResolvedValue(null); // No se encuentra
            const updateSpy = jest.spyOn(Ministerio, 'update'); // Espiamos update para ver si se llama

            const res = await request(app)
                .put('/api/ministerios')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            expect(res.statusCode).toBe(500); // El error no tiene statusCode, por defecto es 500
            expect(res.body.message).toBe(`No se encontró un ministerio con el código ${updateData.cod}`);
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
            expect(updateSpy).not.toHaveBeenCalled(); // No se debe intentar actualizar
        });
    });

    // --- TESTS PARA DELETE /api/ministerios/:cod ---
    describe('DELETE /api/ministerios/:cod', () => {
        it('debe eliminar un ministerio y devolver 1 con status 200', async () => {
            const testCode = 'MIN_DELETE';
            const destroySpy = jest.spyOn(Ministerio, 'destroy').mockResolvedValue(1);

            const res = await request(app)
                .delete(`/api/ministerios/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);
                
            expect(res.statusCode).toBe(200);
            expect(res.body).toBe(1); // El controlador devuelve el número de filas afectadas
            expect(destroySpy).toHaveBeenCalledWith({ where: { cod: testCode } });
        });

        it('debe devolver un error 400 si no se encuentra el ministerio a eliminar', async () => {
            const testCode = 'NO_EXISTE';
            const destroySpy = jest.spyOn(Ministerio, 'destroy').mockResolvedValue(0);

            const res = await request(app)
                .delete(`/api/ministerios/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("No existen datos para eliminar");
        });
    });
});