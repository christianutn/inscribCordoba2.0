import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import TipoCertificacion from '../models/tipoCertificacion.models.js';

// --- MOCK DE AUTENTICACIÓN ---
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        req.user = { user: { cuil: '20378513376', nombre: 'Usuario', apellido: 'Mockeado', rol: 'ADM' } };
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));

describe('Rutas de Tipo de Certificación (con Auth Mockeada)', () => {
    
    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        token_adm = 'mocked-auth-token';
    });
    
    // Restauramos los mocks después de cada test para un entorno limpio.
    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET /api/tiposCertificaciones ---
    describe('GET /api/tiposCertificaciones', () => {
        it('debe devolver una lista de certificaciones ordenada por código', async () => {
            const mockData = [{ cod: 'ASIS', nombre: 'Asistencia' }, { cod: 'APROB', nombre: 'Aprobación' }];
            const findAllSpy = jest.spyOn(TipoCertificacion, 'findAll').mockResolvedValue(mockData);

            const res = await request(app)
                .get('/api/tiposCertificaciones')
                .set('Authorization', `Bearer ${token_adm}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockData);
            // Verificamos que se llamó con la cláusula de orden correcta
            expect(findAllSpy).toHaveBeenCalledWith({ order: [['cod', 'ASC']] });
        });

        it('debe devolver un array vacío con status 200 si no hay datos', async () => {
            jest.spyOn(TipoCertificacion, 'findAll').mockResolvedValue([]);
            
            const res = await request(app)
                .get('/api/tiposCertificaciones')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });
    });

    // --- TESTS PARA GET /api/tiposCertificaciones/:cod ---
    describe('GET /api/tiposCertificaciones/:cod', () => {
        it('debe devolver una certificación específica por su código', async () => {
            const testCode = 'APROB';
            const mockData = { cod: 'APROB', nombre: 'Aprobación' };
            const findOneSpy = jest.spyOn(TipoCertificacion, 'findOne').mockResolvedValue(mockData);

            const res = await request(app)
                .get(`/api/tiposCertificaciones/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockData);
            // Verificamos que se llamó con el 'where' correcto
            expect(findOneSpy).toHaveBeenCalledWith({ where: { cod: testCode } });
        });

        it('debe devolver null con status 200 si la certificación no se encuentra', async () => {
            const testCode = 'NO_EXISTE';
            jest.spyOn(TipoCertificacion, 'findOne').mockResolvedValue(null);

            const res = await request(app)
                .get(`/api/tiposCertificaciones/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toBeNull();
        });
    });
});

