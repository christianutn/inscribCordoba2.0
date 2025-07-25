import request from 'supertest';
import { app, initDb } from '../index.js'; // Ajusta la ruta a tu app si es necesario
import sequelize from '../config/database.js';
import Area from '../models/area.models.js';
import Ministerio from '../models/ministerio.models.js';
import passport from "passport";
// Mockeamos passport para saltarnos la autenticación real en todos los tests
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        // Se inyecta un usuario ADM por defecto para pasar las validaciones de autorización.
        req.user = {
            user: {
                cuil: '20378513376',
                nombre: 'Usuario',
                apellido: 'Mockeado',
                rol: 'ADM'
            }
        };
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));

describe('Rutas de Areas (/api/areas)', () => {
    let token_adm;
    const RUTA_BASE = '/api/areas';

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        // El token es de relleno, ya que el mock de passport se encarga de la autenticación.
        token_adm = 'mocked-auth-token';
    });

    afterEach(() => {
        // Limpiamos los mocks después de cada test para asegurar que son independientes.
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET / ---
    describe(`GET ${RUTA_BASE}`, () => {
        it('debe devolver todas las áreas con sus detalles', async () => {
            const mockAreas = [{ cod: 'SYS', nombre: 'Sistemas', ministerio: 'SG' }];
            const findAllSpy = jest.spyOn(Area, 'findAll').mockResolvedValue(mockAreas);

            const res = await request(app).get(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockAreas);
            // Verificamos que se llamó con el 'include' correcto
            expect(findAllSpy).toHaveBeenCalledWith(expect.objectContaining({ include: expect.any(Array) }));
        });

        it('debe devolver 404 si no se encuentran áreas', async () => {
            jest.spyOn(Area, 'findAll').mockResolvedValue([]);

            const res = await request(app).get(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No existen áreas');
        });
    });

    // --- TESTS PARA POST / ---
    describe(`POST ${RUTA_BASE}`, () => {
        it('debe crear una nueva área y devolverla', async () => {
            const nuevaAreaData = { cod: 'NEW', nombre: 'Nueva Area', ministerio: 'SG' };
            const createSpy = jest.spyOn(Area, 'create').mockResolvedValue(nuevaAreaData);
            jest.spyOn(Ministerio, 'findOne').mockResolvedValue({ cod: 'SG' });
            jest.spyOn(Area, 'findOne').mockResolvedValue(null);
            const res = await request(app).post(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`).send(nuevaAreaData);

            expect(res.statusCode).toBe(201);
        });

    });

    // --- TESTS PARA PUT / ---
    describe(`PUT ${RUTA_BASE}`, () => {
        const updateData = { cod: 'SYS', newCod: 'SYS-UPD', nombre: 'Sistemas Updated', ministerio: 'SG-UPD', esVigente: false };

        it('debe actualizar un área existente correctamente', async () => {
            const updateSpy = jest.spyOn(Area, 'update').mockResolvedValue([1]); // 1 fila afectada
            jest.spyOn(Area, 'findOne').mockResolvedValue({ cod: updateData.cod });
            jest.spyOn(Ministerio, 'findByPk').mockResolvedValue({ cod: updateData.ministerio });

            const res = await request(app).put(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`).send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Área actualizada correctamente.');
            expect(updateSpy).toHaveBeenCalledWith(
                { cod: updateData.newCod, nombre: updateData.nombre, ministerio: updateData.ministerio, esVigente: updateData.esVigente },
                { where: { cod: updateData.cod } }
            );
        });

        it('debe lanzar un error si la actualización no afecta a ninguna fila', async () => {
            jest.spyOn(Area, 'update').mockResolvedValue([0]); // 0 filas afectadas

            const res = await request(app).put(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`).send(updateData);

            expect(res.statusCode).toBe(500); // El controlador lanza un error genérico
            expect(res.body.message).toBe('No hubo cambios para actualizar.');
        });
    });

    // --- TESTS PARA DELETE /:cod ---
    describe(`DELETE ${RUTA_BASE}/:cod`, () => {
        it('debe eliminar un área existente correctamente', async () => {
            const codParaEliminar = 'SYS';
            const destroySpy = jest.spyOn(Area, 'destroy').mockResolvedValue(1); // 1 fila afectada

            const res = await request(app).delete(`${RUTA_BASE}/${codParaEliminar}`).set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Área eliminada correctamente.');
            expect(destroySpy).toHaveBeenCalledWith({ where: { cod: codParaEliminar } });
        });

        it('debe devolver 404 si el área a eliminar no se encuentra', async () => {
            jest.spyOn(Area, 'destroy').mockResolvedValue(0); // 0 filas afectadas

            const res = await request(app).delete(`${RUTA_BASE}/NOEXIST`).set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Área no encontrada.');
        });
    });
});