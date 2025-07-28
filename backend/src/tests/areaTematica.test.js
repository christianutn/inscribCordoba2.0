import request from 'supertest';
import { app, initDb } from '../index.js'; // Ajusta la ruta a tu app si es necesario
import sequelize from '../config/database.js';
import AreaTematica from '../models/areaTematica.models.js';

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

describe('Rutas de areasTematicas', () => {

    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        // El token es de relleno, ya que el mock de passport se encarga de la autenticación.
        token_adm = 'mocked-auth-token';
    });

    afterEach(() => {
        // Limpiamos los mocks después de cada test para asegurar que son independientes.
        jest.clearAllMocks()

    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET /api/areasTematicas ---
    describe('GET /api/areasTematicas', () => {

        it('debe devolver todas las áreas temáticas ordenadas por código', async () => {
            // ARRANGE:
            // 1. Preparamos datos falsos para la respuesta.
            const mockAreas = [
                { cod: 'A-01', nombre: 'Área Alpha' },
                { cod: 'B-02', nombre: 'Área Beta' },
            ];
            // 2. Espiamos y mockeamos el método findAll del modelo.
            const findAllSpy = jest.spyOn(AreaTematica, 'findAll').mockResolvedValue(mockAreas);

            // ACT:
            // 3. Hacemos la petición a la ruta.
            const res = await request(app)
                .get('/api/areasTematicas') // Asumiendo que esta es tu ruta base
                .set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            // 4. Verificamos los resultados.
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockAreas);
            // Verificamos que el controlador llamó a findAll con la opción de ordenamiento correcta.
            expect(findAllSpy).toHaveBeenCalledWith({
                order: [['cod', 'ASC']]
            });
        });

        it('debe devolver un error 500 si la consulta a la base de datos falla', async () => {
            // ARRANGE:
            // 1. Simulamos un error en la base de datos.
            jest.spyOn(AreaTematica, 'findAll').mockRejectedValue(new Error('Error de DB'));

            // ACT:
            const res = await request(app)
                .get('/api/areasTematicas')
                .set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            // Tu controlador pasa el error a next(), por lo que el manejador de errores de Express
            // debería devolver un 500 (Internal Server Error).
            expect(res.statusCode).toBe(500);
        });
    });

    // --- TESTS PARA GET /api/areasTematicas/:cod ---
    describe('GET /api/areasTematicas/:cod', () => {

        it('debe devolver un área temática específica si se encuentra por su código', async () => {
            // ARRANGE:
            const codBuscado = 'A-01';
            const mockArea = { cod: codBuscado, nombre: 'Área Alpha' };
            const findOneSpy = jest.spyOn(AreaTematica, 'findOne').mockResolvedValue(mockArea);

            // ACT:
            const res = await request(app)
                .get(`/api/areasTematicas/${codBuscado}`) // Usamos el código en la URL
                .set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockArea);
            // Verificamos que se llamó a findOne con el `where` correcto.
            expect(findOneSpy).toHaveBeenCalledWith({ where: { cod: codBuscado } });
        });

        it('debe devolver null si el área temática no se encuentra', async () => {
            // ARRANGE:
            const codNoExistente = 'Z-99';
            // Simulamos el caso en que la base de datos no encuentra nada.
            jest.spyOn(AreaTematica, 'findOne').mockResolvedValue(null);

            // ACT:
            const res = await request(app)
                .get(`/api/areasTematicas/${codNoExistente}`)
                .set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            // Tu controlador devuelve directamente el resultado de la consulta.
            // Si la consulta devuelve null, la respuesta JSON será null, lo cual es correcto.
            expect(res.statusCode).toBe(200);
            expect(res.body).toBeNull();
        });

        it('debe devolver un error 500 si la consulta a la base de datos falla', async () => {
            // ARRANGE:
            const codBuscado = 'A-01';
            jest.spyOn(AreaTematica, 'findOne').mockRejectedValue(new Error('Error de DB'));

            // ACT:
            const res = await request(app)
                .get(`/api/areasTematicas/${codBuscado}`)
                .set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            expect(res.statusCode).toBe(500);
        });
    });
});