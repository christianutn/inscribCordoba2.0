import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import TipoCapacitacion from '../models/tipoCapacitacion.models.js';

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
// Mockeamos la función de utilidad para que el test de PUT no dependa de su implementación real.
jest.mock('../utils/parseEsVigente.js', () => jest.fn(val => val));


describe('Rutas de Tipo de Capacitación (con Auth Mockeada)', () => {

    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        // Aunque el token no se verifica, es buena práctica tener la variable
        token_adm = 'mocked-auth-token';
    });

    // Restauramos los mocks después de cada test para que no interfieran entre sí.
    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET ---
    describe('GET /api/tiposCapacitacion', () => {
        it('debe devolver una lista de tipos de capacitación con status 200', async () => {
            const mockData = [{ cod: 'T01', nombre: 'Técnica' }, { cod: 'S02', nombre: 'Seguridad' }];
            jest.spyOn(TipoCapacitacion, 'findAll').mockResolvedValue(mockData);

            const res = await request(app).get('/api/tiposCapacitacion').set('Authorization', `Bearer ${token_adm}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockData);
        });

        it('debe devolver un error 404 si no existen tipos de capacitación', async () => {
            jest.spyOn(TipoCapacitacion, 'findAll').mockResolvedValue([]);
            const res = await request(app).get('/api/tiposCapacitacion').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("No se encontraron tipos de capacitación");
        });
    });

    // --- TESTS PARA POST ---
    describe('POST /api/tiposCapacitacion', () => {
        it('debe crear un nuevo tipo de capacitación y devolverlo con status 201', async () => {
            const newData = { cod: 'NEW', nombre: 'Nueva Capacitación' };
            const createSpy = jest.spyOn(TipoCapacitacion, 'create').mockResolvedValue(newData);

            const res = await request(app)
                .post('/api/tiposCapacitacion')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(newData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(newData);
            expect(createSpy).toHaveBeenCalledWith(newData);
        });

        it('debe devolver un error 400 si el código es demasiado largo', async () => {
            const invalidData = { cod: 'ESTE_CODIGO_ES_DEMASIADO_LARGO', nombre: 'Inválido' };

            const res = await request(app)
                .post('/api/tiposCapacitacion')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(invalidData);
            
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("El código no puede ser mayor a 15 caracteres");
        });
    });
    
    // --- TESTS PARA PUT ---
    describe('PUT /api/tiposCapacitacion', () => {
        it('debe actualizar un tipo de capacitación y devolver el número de filas afectadas', async () => {
            const updateData = { cod: 'T01', newCod: 'T01_V2', nombre: 'Técnica Avanzada', esVigente: true };

            jest.spyOn(TipoCapacitacion, 'findOne').mockResolvedValue({ cod: 'T01' }); // Simula que existe
            const updateSpy = jest.spyOn(TipoCapacitacion, 'update').mockResolvedValue([1]);

            const res = await request(app)
                .put('/api/tiposCapacitacion')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([1]);

            const expectedPayload = { cod: updateData.newCod, nombre: updateData.nombre, esVigente: updateData.esVigente };
            expect(updateSpy).toHaveBeenCalledWith(expectedPayload, { where: { cod: updateData.cod } });
        });

        it('debe devolver error 404 si el tipo de capacitación a actualizar no existe', async () => {
            const updateData = { cod: 'NO_EXISTE', nombre: 'Capacitación Fantasma' };
            jest.spyOn(TipoCapacitacion, 'findOne').mockResolvedValue(null); // Simula que no existe

            const res = await request(app)
                .put('/api/tiposCapacitacion')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);
            
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("El tipo de capacitación no existe");
        });
    });

    // --- TESTS PARA DELETE ---
    describe('DELETE /api/tiposCapacitacion/:cod', () => {
        it('debe eliminar un tipo de capacitación y devolver el número de filas afectadas', async () => {
            const testCode = 'T01';
            const destroySpy = jest.spyOn(TipoCapacitacion, 'destroy').mockResolvedValue(1);

            const res = await request(app)
                .delete(`/api/tiposCapacitacion/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toBe(1);
            expect(destroySpy).toHaveBeenCalledWith({ where: { cod: testCode } });
        });

        it('debe devolver un error 404 si no se encuentra el tipo de capacitación a eliminar', async () => {
            const testCode = 'NO_EXISTE';
            jest.spyOn(TipoCapacitacion, 'destroy').mockResolvedValue(0);

            const res = await request(app)
                .delete(`/api/tiposCapacitacion/${testCode}`)
                .set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("No se pudo borrar el tipo de capacitación");
        });
    });
});