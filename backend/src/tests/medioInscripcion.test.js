import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';
import MedioInscripcion from '../models/medioInscripcion.models.js';

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

// Mockeamos el parser para que el test de PUT no dependa de él
jest.mock('../utils/parseEsVigente.js', () => jest.fn(val => val));


describe('Rutas de Medios de Inscripción (con Auth Mockeada)', () => {

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
    describe('GET /api/mediosInscripcion', () => {
        it('debe devolver 200 y un array de medios de inscripción', async () => {
            const mockMedios = [
                { cod: "TESTJEST", nombre: "Test jest", esVigente: 1 },
                { cod: "TESTJEST2", nombre: "Test jest 2", esVigente: 1 }
            ];
            // El espía se crea y se destruye dentro del test
            const findAllSpy = jest.spyOn(MedioInscripcion, 'findAll').mockResolvedValue(mockMedios);

            const res = await request(app)
                .get('/api/mediosInscripcion')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockMedios);
            expect(findAllSpy).toHaveBeenCalledTimes(1);

            findAllSpy.mockRestore(); // Se restaura el espía
        });

        // Test para el caso de no encontrar resultados (controlador lanza 404)
        it('debe devolver 404 si no existen medios de inscripción', async () => {
            const findAllSpy = jest.spyOn(MedioInscripcion, 'findAll').mockResolvedValue([]);
            
            const res = await request(app)
                .get('/api/mediosInscripcion')
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("No existen medios de inscripción");

            findAllSpy.mockRestore();
        });
    });

    //--- TESTS PARA POST ---
    describe('POST /api/mediosInscripcion', () => {
        it('debe crear un nuevo medio de inscripción y devolverlo con status 201', async () => {
            const newInstanciaData = { cod: "TESTJEST3", nombre: "Test jest 3" };
            const createdInstanciaMock = { id: 1, ...newInstanciaData, esVigente: true };

            // Mockeamos las llamadas a la BD que hace el controlador
            const findOneSpy = jest.spyOn(MedioInscripcion, 'findOne').mockResolvedValue(null);
            const createSpy = jest.spyOn(MedioInscripcion, 'create').mockResolvedValue(createdInstanciaMock);

            const res = await request(app)
                .post('/api/mediosInscripcion')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(newInstanciaData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(createdInstanciaMock);
            expect(createSpy).toHaveBeenCalledWith(newInstanciaData);

            findOneSpy.mockRestore();
            createSpy.mockRestore();
        });
    });

    // --- TESTS PARA PUT ---
    describe('PUT /api/mediosInscripcion', () => {
        it('debe actualizar una instancia y devolver el número de filas afectadas', async () => {
            const requestBody = { cod: "TESTJEST", newCod: "TESTJEST2", nombre: "nuevo teste de prueba", esVigente: 0 };
            
            // Mockeamos las llamadas a la BD
            const findOneSpy = jest.spyOn(MedioInscripcion, 'findOne').mockResolvedValue({ cod: 'TESTJEST' });
            const updateSpy = jest.spyOn(MedioInscripcion, 'update').mockResolvedValue([1]);

            const res = await request(app)
                .put('/api/mediosInscripcion')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(requestBody);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([1]); // Sequelize update devuelve [1]

            const expectedUpdatePayload = { cod: "TESTJEST2", nombre: "nuevo teste de prueba", esVigente: 0 };
            expect(updateSpy).toHaveBeenCalledWith(expectedUpdatePayload, { where: { cod: requestBody.cod } });
            
            findOneSpy.mockRestore();
            updateSpy.mockRestore();
        });
    });

    // --- TESTS PARA DELETE ---
    describe('DELETE /api/mediosInscripcion/:cod', () => {
        it('debe eliminar una instancia y devolver el número de filas afectadas (1)', async () => {
            const testCode = 'COD_A_BORRAR';
            const destroySpy = jest.spyOn(MedioInscripcion, 'destroy').mockResolvedValue(1);

            const res = await request(app)
                .delete(`/api/mediosInscripcion/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toBe(1); // Sequelize destroy devuelve 1
            expect(destroySpy).toHaveBeenCalledWith({ where: { cod: testCode } });

            destroySpy.mockRestore();
        });

        it('debe devolver un error 404 si no se encuentra qué eliminar', async () => {
            const nonExistentCode = 'COD_INEXISTENTE';
            const destroySpy = jest.spyOn(MedioInscripcion, 'destroy').mockResolvedValue(0);

            const res = await request(app)
                .delete(`/api/mediosInscripcion/${nonExistentCode}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No se encontraron coincidencias para borrar');

            destroySpy.mockRestore();
        });
    });
});