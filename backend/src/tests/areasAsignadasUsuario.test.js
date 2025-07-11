import request from 'supertest';
import { app, initDb } from '../index.js'; // Ajusta la ruta a tu app si es necesario
import sequelize from '../config/database.js';
import AreasAsignadasUsuario from '../models/areasAsignadasUsuario.models.js';
import Area from '../models/area.models.js';
import Usuario from '../models/usuario.models.js';
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

describe('Rutas de AreasAsignadasUsuario (/api/areasAsignadasUsuario)', () => {
    let token_adm;
    const RUTA_BASE = '/api/areasAsignadasUsuario';

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
        it('debe devolver todas las áreas asignadas', async () => {
            const mockAsignaciones = [{ usuario: '20111111111', area: 'SYS' }];
            jest.spyOn(AreasAsignadasUsuario, 'findAll').mockResolvedValue(mockAsignaciones);
            
            const res = await request(app).get(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockAsignaciones);
        });

        it('debe devolver 404 si no se encuentran asignaciones', async () => {
            jest.spyOn(AreasAsignadasUsuario, 'findAll').mockResolvedValue([]);
            
            const res = await request(app).get(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No se encontraron areas asignadas');
        });
    });

    // --- TESTS PARA GET usuario/:usuario ---
    describe(`GET ${RUTA_BASE}/usuario/:usuario`, () => {
        it('debe devolver las áreas asignadas para un usuario específico', async () => {
            const cuilUsuario = '20222222222';
            const mockAsignaciones = [{ usuario: cuilUsuario, area: 'TEST' }];
            const findAllSpy = jest.spyOn(AreasAsignadasUsuario, 'findAll').mockResolvedValue(mockAsignaciones);
            
            const res = await request(app).get(`${RUTA_BASE}/usuario/${cuilUsuario}`).set('Authorization', `Bearer ${token_adm}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockAsignaciones);
        });
    });

    // --- TESTS PARA POST / ---
    describe(`POST ${RUTA_BASE}`, () => {
        it('debe crear una nueva asignación y devolverla', async () => {
            const nuevaAsignacion = { cuil_usuario: '20333333333', cod_area: 'NEW', comentario: 'Nuevo acceso' };
            jest.spyOn(AreasAsignadasUsuario, 'create').mockResolvedValue({ usuario: '20333333333', area: 'NEW', comentario: 'Nuevo acceso' });
            jest.spyOn(Usuario, 'findOne').mockResolvedValue({ cuil: '20333333333' });
            jest.spyOn(Area, 'findOne').mockResolvedValue({ cod: 'NEW' });
            jest.spyOn(AreasAsignadasUsuario, 'findOne').mockResolvedValue(null);
            
            const res = await request(app).post(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`).send(nuevaAsignacion);

            expect(res.statusCode).toBe(201);
        });

        it('debe devolver 400 si la creación falla', async () => {
            jest.spyOn(AreasAsignadasUsuario, 'create').mockResolvedValue(null);
            
            const res = await request(app).post(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`).send({ cuil_usuario: 'fail', cod_area: 'fail' });
            
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('No se pudo crear la nueva asignación');
        });
    });

    // --- TESTS PARA PUT / ---
    describe(`PUT ${RUTA_BASE}`, () => {
        const data = { cuil_usuario: '20444444444', cod_area: 'UPD', comentario: 'Comentario actualizado' };
        
        it('debe actualizar una asignación existente', async () => {
            jest.spyOn(AreasAsignadasUsuario, 'findOne').mockResolvedValue({ usuario: data.cuil_usuario, area: data.cod_area });
            jest.spyOn(AreasAsignadasUsuario, 'update').mockResolvedValue([1]);

            const res = await request(app).put(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`).send(data);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Asignación actualizada correctamente');
        });

        it('debe devolver 404 si la asignación a actualizar no se encuentra', async () => {
            jest.spyOn(AreasAsignadasUsuario, 'findOne').mockResolvedValue(null);
            
            const res = await request(app).put(RUTA_BASE).set('Authorization', `Bearer ${token_adm}`).send(data);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No se encontró la asignación');
        });
    });

    // --- TESTS PARA DELETE /:usuario/:area ---
    describe(`DELETE ${RUTA_BASE}/:usuario/:area`, () => {
        const usuario = '20555555555';
        const area = 'DEL';

        it('debe eliminar una asignación existente', async () => {
            const destroySpy = jest.spyOn(AreasAsignadasUsuario, 'destroy').mockResolvedValue(1);
            
            const res = await request(app).delete(`${RUTA_BASE}/${usuario}/${area}`).set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Asignación eliminada correctamente');
            expect(destroySpy).toHaveBeenCalledWith({ where: { usuario: usuario, area: area } });
        });

        it('debe devolver 404 si la asignación a eliminar no se encuentra', async () => {
            jest.spyOn(AreasAsignadasUsuario, 'destroy').mockResolvedValue(0);
            
            const res = await request(app).delete(`${RUTA_BASE}/${usuario}/${area}`).set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No se encontró la asignación para eliminar');
        });
    });
});