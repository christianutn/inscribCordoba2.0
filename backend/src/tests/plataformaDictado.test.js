import request from 'supertest';
import sequelize from '../config/database.js'; 
import { app, initDb } from '../index.js'; 
import PlataformaDictado from '../models/plataformaDictado.models.js';

// Mock de Passport para simular autenticación con un usuario rol 'ADM'
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        req.user = { user: { cuil: '20378513376', nombre: 'Usuario', apellido: 'Mockeado', rol: 'ADM' } };
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));

// Mockeamos el parser de 'esVigente' para que no dependamos de su implementación
jest.mock('../utils/parseEsVigente.js', () => jest.fn(val => val));


describe('Rutas de Plataforma de Dictado (con Auth Mockeada)', () => {
    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        token_adm = 'mocked-auth-token';
    });
    
    // Restauramos todos los mocks después de cada test para asegurar un entorno limpio.
    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET ---
    describe('GET /api/plataformasDictado', () => {
        it('debe devolver un array de plataformas y status 200', async () => {
            const mockPlataformas = [{ cod: 'ZOOM', nombre: 'Zoom' }, { cod: 'MEET', nombre: 'Google Meet' }];
            const findAllSpy = jest.spyOn(PlataformaDictado, 'findAll').mockResolvedValue(mockPlataformas);

            const res = await request(app)
                .get('/api/plataformasDictado')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockPlataformas);
        });

        it('debe devolver un error 404 si no hay plataformas', async () => {
            const findAllSpy = jest.spyOn(PlataformaDictado, 'findAll').mockResolvedValue([]);
            const res = await request(app)
                .get('/api/plataformasDictado')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("No existen plataformas de dictado");
        });
    });

    // --- TESTS PARA POST ---
    describe('POST /api/plataformasDictado', () => {
        it('debe crear una nueva plataforma y devolverla con status 200', async () => {
            const newData = { cod: 'TEAMS', nombre: 'Microsoft Teams' };
            
            jest.spyOn(PlataformaDictado, 'findOne').mockResolvedValue(null);
            const createSpy = jest.spyOn(PlataformaDictado, 'create').mockResolvedValue(newData);

            const res = await request(app)
                .post('/api/plataformasDictado')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(newData);

            expect(res.statusCode).toBe(200); // Tu controlador devuelve 200
            expect(res.body).toEqual(newData);
            expect(createSpy).toHaveBeenCalledWith(newData);
        });

        it('debe devolver un error 400 si el código ya existe', async () => {
            const existingData = { cod: 'ZOOM', nombre: 'Plataforma Zoom' };
            jest.spyOn(PlataformaDictado, 'findOne').mockResolvedValue(existingData);

            const res = await request(app)
                .post('/api/plataformasDictado')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(existingData);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("El Código ya existe");
        });
    });

    // --- TESTS PARA PUT ---
    describe('PUT /api/plataformasDictado', () => {
        it('debe actualizar una plataforma y devolver el número de filas afectadas', async () => {
            const updateData = { cod: 'ZOOM', nombre: 'Zoom Meetings', newCod: 'ZOOM_PRO', esVigente: 1 };
            
            const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);
            jest.spyOn(PlataformaDictado, 'findOne').mockResolvedValue({ toJSON: () => ({ cod: 'ZOOM' }) });
            jest.spyOn(PlataformaDictado, 'update').mockResolvedValue([1]);

            const res = await request(app)
                .put('/api/plataformasDictado')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([1]); 
            expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
        });

        it('debe devolver error 404 si la plataforma no se pudo actualizar', async () => {
            const updateData = { cod: 'NOEXISTE', nombre: 'Plataforma Inexistente' };
            const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);
            
            jest.spyOn(PlataformaDictado, 'findOne').mockResolvedValue({ toJSON: () => ({ cod: 'NOEXISTE' }) });
            jest.spyOn(PlataformaDictado, 'update').mockResolvedValue([0]); // 0 filas afectadas

            const res = await request(app)
                .put('/api/plataformasDictado')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);
            
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("No se pudo actualizar la plataforma de dictado");
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    // --- TESTS PARA DELETE ---
    describe('DELETE /api/plataformasDictado/:cod', () => {
        it('debe eliminar una plataforma y devolver un mensaje de éxito', async () => {
            const testCode = 'ZOOM';
            const destroySpy = jest.spyOn(PlataformaDictado, 'destroy').mockResolvedValue(1);

            const res = await request(app)
                .delete(`/api/plataformasDictado/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Plataforma de dictado eliminada");
        });

        it('debe devolver un error 404 si no se encuentra la plataforma a eliminar', async () => {
            const testCode = 'NOEXISTE';
            const destroySpy = jest.spyOn(PlataformaDictado, 'destroy').mockResolvedValue(0);

            const res = await request(app)
                .delete(`/api/plataformasDictado/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("No se encontraron datos para eliminar");
        });
    });
});