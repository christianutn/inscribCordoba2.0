import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import Rol from '../models/rol.models.js'; // El nombre del modelo es 'Rol', no 'rolModel'

// --- MOCK DE AUTENTICACIÓN (Sin cambios) ---
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        req.user = { user: { cuil: '20378513376', nombre: 'Usuario', apellido: 'Mockeado', rol: 'ADM' } };
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));

describe('API de Roles', () => {

    // Asumimos que esta configuración es necesaria para el entorno de test.
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
    });

    // Restauramos los mocks después de cada test para que no interfieran entre sí.
    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA LA RUTA DE ROLES ---
    describe('GET /api/roles', () => {

        // Escenario 1: Caso de Éxito
        it('debe devolver una lista de roles con status 200', async () => {
            // 1. Preparamos los datos mockeados que queremos que devuelva la BD.
            const mockDataRoles = [
                { id: 1, rol: 'ADM' },
                { id: 2, rol: 'USR' }
            ];

            // 2. Simulamos las instancias de Sequelize que tendrían el método .toJSON()
            const mockSequelizeInstances = mockDataRoles.map(rol => ({
                ...rol,
                toJSON: () => rol,
            }));

            // 3. Mockeamos `findAll` para que devuelva nuestras instancias simuladas.
            const findAllSpy = jest.spyOn(Rol, 'findAll').mockResolvedValue(mockSequelizeInstances);

            // 4. Hacemos la llamada a la API. (Asumiendo que la ruta es /api/roles)
            const res = await request(app)
                .get('/api/roles')
                .set('Authorization', 'Bearer mocked-token'); // La autenticación es necesaria

            // 5. Verificamos los resultados
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockDataRoles); // El body debe ser el JSON limpio
            expect(findAllSpy).toHaveBeenCalledTimes(1); // Verificamos que se llamó a la función
        });

    });
});