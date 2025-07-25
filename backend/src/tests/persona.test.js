import request from 'supertest';
import sequelize from '../config/database.js'; 
import { app, initDb } from '../index.js'; 
import Persona from '../models/persona.models.js';

// --- MOCK DE AUTENTICACIÓN ---
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        req.user = { user: { cuil: '20378513376', nombre: 'Usuario', apellido: 'Mockeado', rol: 'ADM' } };
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));

// --- MOCK DE UTILIDADES ---
// Mockeamos las funciones de utilidad para aislarlas del test del controlador.
// Esto nos permite enfocarnos en la lógica del controlador y no en la de las utilidades.
jest.mock('../utils/validarCuil.js', () => jest.fn());
jest.mock('../utils/validarMail.js', () => jest.fn());
jest.mock('../utils/tratarNombres.js', () => jest.fn(nombre => nombre)); // Simula que devuelve el nombre sin cambios.

// Importamos los mocks para poder controlarlos en los tests.
import validarCuil from '../utils/validarCuil.js';
import validarEmail from '../utils/validarMail.js';


describe('Rutas de Personas (con Auth Mockeada)', () => {

    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        token_adm = 'mocked-auth-token';
    });

    // Antes de cada test, limpiamos el historial de los mocks de las utilidades.
    beforeEach(() => {
        validarCuil.mockClear();
        validarEmail.mockClear();
    });

    afterAll(async () => {
        await sequelize.close();
    });
    
    // --- TESTS PARA GET ---
    describe('GET /api/personas', () => {
        it('debe devolver un array de personas y status 200', async () => {
            const mockPersonas = [{ cuil: '20111111111', nombre: 'Juan', apellido: 'Perez', mail: 'juan.perez@test.com', celular: "3516111593" }];
            const findAllSpy = jest.spyOn(Persona, 'findAll').mockResolvedValue(mockPersonas);

            const res = await request(app)
                .get('/api/personas')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockPersonas);
            findAllSpy.mockRestore();
        });

        it('debe devolver un error 404 si no hay personas', async () => {
            const findAllSpy = jest.spyOn(Persona, 'findAll').mockResolvedValue([]);

            const res = await request(app)
                .get('/api/personas')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            findAllSpy.mockRestore();
        });
    });

    // --- TESTS PARA POST ---
    describe('POST /api/personas', () => {
        it('debe crear una nueva persona y devolverla con status 201', async () => {
            const newPersonaData = { cuil: '20694512236', nombre: 'Ana', apellido: 'Gomez', mail: 'ana@test.com', celular: "3516111593" };
            
            // Simulamos que las validaciones externas pasan
            validarCuil.mockReturnValue(true);
            validarEmail.mockReturnValue(true);

            // Mockeamos las llamadas a la BD
            const findOneSpy = jest.spyOn(Persona, 'findOne').mockResolvedValue(null);
            const createSpy = jest.spyOn(Persona, 'create').mockResolvedValue(newPersonaData);

            const res = await request(app)
                .post('/api/personas')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(newPersonaData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(newPersonaData);

            findOneSpy.mockRestore();
            createSpy.mockRestore();
        });

        it('debe devolver un error 400 si el CUIL no es válido', async () => {
            const invalidData = { cuil: '20111111111', nombre: 'Test', apellido: 'Test', mail: 'test@test.com' };
            validarCuil.mockReturnValue(false); // Simulamos que el validador falla

            const res = await request(app)
                .post('/api/personas')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(invalidData);
                
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("El CUIL no es válido");
        });

        it('debe devolver un error 400 si la persona ya existe', async () => {
            const existingData = { cuil: '20333333333', nombre: 'Maria', apellido: 'Lopez', mail: 'maria@test.com' };
            validarCuil.mockReturnValue(true);
            validarEmail.mockReturnValue(true);

            // Simulamos que la persona se encuentra en la BD
            const findOneSpy = jest.spyOn(Persona, 'findOne').mockResolvedValue(existingData);

            const res = await request(app)
                .post('/api/personas')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(existingData);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("La persona ya existe");
            findOneSpy.mockRestore();
        });
    });

    // --- TESTS PARA PUT ---
    describe('PUT /api/personas', () => {
        it('debe actualizar una persona y devolver un mensaje de éxito con status 200', async () => {
            const updateData = { cuil: '20111111111', nombre: 'Juan Carlos', apellido: 'Perez', mail: 'juan.perez@test.com' };
            validarCuil.mockReturnValue(true);
            validarEmail.mockReturnValue(true);

            const updateSpy = jest.spyOn(Persona, 'update').mockResolvedValue([1]);

            const res = await request(app)
                .put('/api/personas')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe(`Los datos de ${updateData.nombre} ${updateData.apellido} han sido actualizados con exito`);
            updateSpy.mockRestore();
        });

        it('debe devolver un error 400 si no se encuentra la persona a actualizar', async () => {
            const updateData = { cuil: '20999999999', nombre: 'Fantasma', apellido: 'Json', mail: 'noexisto@test.com' };
            validarCuil.mockReturnValue(true);
            validarEmail.mockReturnValue(true);
            
            const updateSpy = jest.spyOn(Persona, 'update').mockResolvedValue([0]);

            const res = await request(app)
                .put('/api/personas')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("No se encontro la persona");
            updateSpy.mockRestore();
        });
    });

    // --- TESTS PARA DELETE ---
    describe('DELETE /api/personas/:cuil', () => {
        it('debe eliminar una persona y devolver un mensaje de éxito con status 200', async () => {
            const cuilToDelete = '20111111111';
            const destroySpy = jest.spyOn(Persona, 'destroy').mockResolvedValue(1);

            const res = await request(app)
                .delete(`/api/personas/${cuilToDelete}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Persona eliminada con éxito");
            destroySpy.mockRestore();
        });

        it('debe devolver un error 400 si no se encuentra la persona a eliminar', async () => {
            const cuilToDelete = '20999999999';
            const destroySpy = jest.spyOn(Persona, 'destroy').mockResolvedValue(0);

            const res = await request(app)
                .delete(`/api/personas/${cuilToDelete}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("No se encontro la persona");
            destroySpy.mockRestore();
        });
    });
});