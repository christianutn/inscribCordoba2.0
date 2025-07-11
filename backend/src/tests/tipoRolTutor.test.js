import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import TipoRolTutor from '../models/tipoRolTutor.models.js';

// --- MOCK DE AUTENTICACIÓN ---
// Mockeamos passport para simular la autenticación y saltarnos el login real.
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        req.user = { user: { cuil: '20378513376', nombre: 'Usuario', apellido: 'Mockeado', rol: 'ADM' } };
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));

describe('Rutas de Tipo de Rol de Tutor (con Auth Mockeada)', () => {
    
    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        token_adm = 'mocked-auth-token';
    });
    
    // Restauramos todos los mocks después de cada test para un entorno limpio.
    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET /api/tiposRolTutor ---
    // Nota: La ruta es una suposición estándar. Ajústala si tu router la define diferente.
    describe('GET /api/tiposRolTutor', () => {

        // Caso de éxito ("Happy Path")
        it('debe devolver una lista de roles de tutor y un status 200', async () => {
            // 1. Arrange: Preparamos los datos y mocks
            const mockData = [
                { id: 1, nombre: 'Tutor Titular' },
                { id: 2, nombre: 'Tutor Asistente' }
            ];
            // Mockeamos el método findAll para que devuelva nuestros datos falsos
            const findAllSpy = jest.spyOn(TipoRolTutor, 'findAll').mockResolvedValue(mockData);

            // 2. Act: Ejecutamos la petición
            const res = await request(app)
                .get('/api/tiposRolTutor') // Asegúrate de que esta ruta sea correcta
                .set('Authorization', `Bearer ${token_adm}`);
            
            // 3. Assert: Verificamos el resultado
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockData);
            expect(findAllSpy).toHaveBeenCalledTimes(1); // Verificamos que se llamó al método
        });

        // Caso de error ("Sad Path")
        it('debe devolver un error 404 si no existen roles de tutor', async () => {
            // 1. Arrange: Mockeamos el método para que devuelva un array vacío
            const findAllSpy = jest.spyOn(TipoRolTutor, 'findAll').mockResolvedValue([]);
            
            // 2. Act
            const res = await request(app)
                .get('/api/tiposRolTutor')
                .set('Authorization', `Bearer ${token_adm}`);

            // 3. Assert: Verificamos la respuesta de error
            expect(res.statusCode).toBe(404);
            // Comprobamos que el mensaje de error es el que define el controlador
            expect(res.body.message).toBe('No existen tipoRolTutor');
        });
    });
});