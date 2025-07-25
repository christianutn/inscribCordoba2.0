import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';
import EstadoInstancia from '../models/estado_instancia.models.js';

// Mockeamos passport para saltarnos la autenticación real en todos los tests
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        req.user = {
            user: {
                cuil: '20378513376',
                nombre: 'Usuario',
                apellido: 'Mockeado',
                rol: 'ADM' // Rol de administrador para que pase las autorizaciones
            }
        };
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));


describe('Rutas de Estados de instancia(con Auth Mockeada)', () => {

    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        // Ya no hacemos login real. Solo asignamos un token de relleno.
        token_adm = 'mocked-auth-token';
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET ---
    describe('GET /api/estadosInstancia', () => {
        it('debe devolver 200 y un array de medios de inscripción', async () => {
            const mockMedios = [
                { cod: "TESTJEST", descripcion: "Test jest"},
                { cod: "TESTJEST2", descripcion: "Test jest 2" }
            ];
            // El espía se crea y se destruye dentro del test
            const findAllSpy = jest.spyOn(EstadoInstancia, 'findAll').mockResolvedValue(mockMedios);

            const res = await request(app)
                .get('/api/estadosInstancia')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockMedios);
            expect(findAllSpy).toHaveBeenCalledTimes(1);

            findAllSpy.mockRestore(); // Se restaura el espía
        });

    });

});