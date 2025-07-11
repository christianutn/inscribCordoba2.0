import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import Tutor from '../models/tutor.models.js';
import Persona from '../models/persona.models.js';
import Area from '../models/area.models.js';
import AreasAsignadasUsuario from '../models/areasAsignadasUsuario.models.js';
import Usuario from '../models/usuario.models.js';
import { Op } from 'sequelize';
import validarEmail from '../utils/validarMail.js';
import validarCuil from '../utils/validarCuil.js';


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

// --- MOCK DE UTILIDADES ---
jest.mock('../utils/validarCuil.js', () => jest.fn());
jest.mock('../utils/validarMail.js', () => jest.fn());
jest.mock('../utils/tratarNombres.js', () => jest.fn(nombre => nombre));


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
    describe('GET /api/tutores', () => {
        it('debe devolver todos los tutores para un rol ADM', async () => {
            const mockTutores = [{ cuil: '20111111111', area: 'AREA01' }];
            jest.spyOn(Tutor, 'findAll').mockResolvedValue(mockTutores);

            const res = await request(app).get('/api/tutores').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockTutores);
        });

    });

    // --- TESTS PARA POST ---
    // --- TESTS PARA PUT ---
    describe('PUT /api/tutores', () => {

        const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };


        // --- PASO 2: Preparar el escenario antes de CADA test del PUT ---
        beforeEach(() => {
            // Limpiamos los "contadores" de nuestros espías. Esto asegura que el test anterior
            // no afecte al siguiente. Si el test de "rollback" corre primero, no queremos
            // que el contador de rollback.toHaveBeenCalled() siga en 1 para el test de "commit".
            mockTransaction.commit.mockClear();
            mockTransaction.rollback.mockClear();

            // Le decimos a Jest que CADA VEZ que se llame a sequelize.transaction()
            // en este bloque `describe`, use nuestro "doble de riesgo".
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);

            // Es buena práctica mockear también las validaciones que no son el foco del test.
            validarCuil.mockReturnValue(true);
            // Mockear la validación de mail
            validarEmail.mockReturnValue(true);
        });

        it('debe actualizar un tutor y devolver un mensaje de éxito', async () => {

            // ARRANGE: Preparar los espías para el resultado esperado
            const personaUpdateSpy = jest.spyOn(Persona, 'update').mockResolvedValue([1]);
            const tutorUpdateSpy = jest.spyOn(Tutor, 'update').mockResolvedValue([1]);


            const updateData = {
                cuil: "20369995248",
                nombre: "Referente Uno Test2",
                apellido: "Test",
                mail: "ref@ref.com",
                celular: "3516987452",
                newCuil: "20369995248",
                area: "TEST",
                esReferente: 0
            };

            // ACT: Ejecutar la acción a probar
            const res = await request(app)
                .put('/api/tutores')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            // ASSERT: Verificar los resultados
            expect(res.statusCode).toBe(200);

            // ¡Ahora sí! Usamos la variable correcta que está en el alcance del test.
            expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
            expect(mockTransaction.rollback).not.toHaveBeenCalled();

        });
    });


    // --- TESTS PARA DELETE ---
    describe('DELETE /api/tutores/:cuil', () => {
        it('debe eliminar un tutor y devolver un mensaje de éxito', async () => {
            const cuilToDelete = '20111111111';
            const destroySpy = jest.spyOn(Tutor, 'destroy').mockResolvedValue(1);

            const res = await request(app)
                .delete(`/api/tutores/${cuilToDelete}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Tutor borrado correctamente');
            expect(destroySpy).toHaveBeenCalledWith({ where: { cuil: cuilToDelete } });
        });

        it('debe devolver error 404 si no se encuentra el tutor a eliminar', async () => {
            const cuilToDelete = '20111111111';
            jest.spyOn(Tutor, 'destroy').mockResolvedValue(0);

            const res = await request(app)
                .delete(`/api/tutores/${cuilToDelete}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No se encontraron datos para borrar');
        });
    });
});