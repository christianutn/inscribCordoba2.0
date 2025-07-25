import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import Restricciones from '../models/controlDataFechaInicioCursada.models.js';

// --- MOCK DE AUTENTICACIÓN (Sin cambios) ---
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        req.user = { user: { cuil: '20378513376', nombre: 'Usuario', apellido: 'Mockeado', rol: 'ADM' } };
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));

describe('Rutas de Restricciones', () => {
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

    // --- TESTS PARA GET (Sin cambios) ---
    describe('GET /api/restricciones/fechasInicioCursada', () => {
        it('debe devolver el objeto de restricciones mockeado con status 200', async () => {
            const mockData = {
                id: 1,
                maximoCursosXMes: 50,
                maximoCuposXMes: 60000,
                maximoCuposXDia: 8000,
                maximoCursosXDia: 8,
                mesBloqueado: 0,
                maximoAcumulado: 50
            };

            const findOneSpy = jest.spyOn(Restricciones, 'findOne').mockResolvedValue({
                ...mockData,
                toJSON: () => mockData
            });

            // Asumo que la ruta GET es la misma que usarás para PUT.
            const res = await request(app)
                .get('/api/restricciones/fechasInicioCursada')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockData);
            expect(findOneSpy).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    // --- TESTS PARA PUT (Nuevos tests) ---
    describe('PUT /api/restricciones/fechasInicioCursada', () => {
        const validUpdateData = {
            maximoCursosXMes: 100,
            maximoCuposXMes: 70000,
            maximoCuposXDia: 9000,
            maximoCursosXDia: 10,
            mesBloqueado: 1,
            maximoAcumulado: 60
        };

        // Escenario 1: Caso de Éxito
        it('debe actualizar las restricciones y devolver un mensaje de éxito con status 200', async () => {
            // Mockeamos que 'update' fue exitoso y actualizó 1 fila.
            const updateSpy = jest.spyOn(Restricciones, 'update').mockResolvedValue([1]);

            const res = await request(app)
                .put('/api/restricciones/fechasInicioCursada')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(validUpdateData);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Restricciones actualizadas' });
            // Verificamos que se llamó a 'update' con los datos correctos.
            expect(updateSpy).toHaveBeenCalledWith(validUpdateData, { where: { id: 1 } });
        });

        
    });
});