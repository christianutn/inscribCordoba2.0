import request from 'supertest';
import { app, initDb } from '../index.js'; // Asegúrate de que la ruta a tu app sea correcta
import sequelize from '../config/database.js';
import Aviso from '../models/avisos.models.js';

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
describe('Rutas de Avisos (/api/avisos)', () => {

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

    // --- TESTS PARA GET /api/avisos ---
    describe('GET /api/avisos', () => {

        it('debe devolver todos los avisos y un status 200', async () => {
            // ARRANGE: Preparamos el escenario.
            // 1. Creamos un array de datos falsos que simulan lo que devolvería la base de datos.
            const mockAvisos = [
                { id: 1, titulo: 'Aviso 1', contenido: 'Contenido del aviso 1', visible: true },
                { id: 2, titulo: 'Aviso 2', contenido: 'Contenido del aviso 2', visible: false },
            ];
            // 2. Espiamos el método `findAll` del modelo Aviso y hacemos que devuelva nuestros datos falsos.
            jest.spyOn(Aviso, 'findAll').mockResolvedValue(mockAvisos);

            // ACT: Ejecutamos la acción que queremos probar.
            const res = await request(app).get('/api/avisos').set('Authorization', `Bearer ${token_adm}`);

            // ASSERT: Verificamos los resultados.
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockAvisos); // El cuerpo de la respuesta debe ser igual a nuestros datos mock.
        });

        it('debe devolver un status 500 si ocurre un error en la base de datos', async () => {
            // ARRANGE:
            // 1. Simulamos un error en la base de datos haciendo que `findAll` rechace la promesa.
            jest.spyOn(Aviso, 'findAll').mockRejectedValue(new Error('Error de conexión'));

            // ACT:
            const res = await request(app).get('/api/avisos');

            // ASSERT:
            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Error al obtener las categorías');
        });
    });

    // --- TESTS PARA POST /api/avisos ---
    describe('POST /api/avisos', () => {

        it('debe crear un nuevo aviso, devolverlo con status 201', async () => {
            // ARRANGE:
            // 1. Definimos los datos del nuevo aviso que enviaremos en la petición.
            const nuevoAvisoData = { titulo: 'Nuevo Aviso', contenido: 'Contenido importante', icono: 'bell', visible: true };
            // 2. Espiamos el método `create` y hacemos que devuelva el mismo objeto, simulando una creación exitosa.
            const createSpy = jest.spyOn(Aviso, 'create').mockResolvedValue(nuevoAvisoData);

            // ACT:
            const res = await request(app)
                .post('/api/avisos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(nuevoAvisoData);

            // ASSERT:
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(nuevoAvisoData);
            // Verificamos que se llamó a `create` con los datos correctos.
            expect(createSpy).toHaveBeenCalledWith(nuevoAvisoData);
        });

        it('debe devolver un status 500 si la creación falla', async () => {
            // ARRANGE:
            const avisoData = { titulo: 'Aviso fallido', contenido: 'Este no se creará' };
            jest.spyOn(Aviso, 'create').mockRejectedValue(new Error('Error de base de datos'));

            // ACT:
            const res = await request(app)
                .post('/api/avisos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(avisoData);

            // ASSERT:
            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Error al crear el aviso');
        });
    });

    // --- TESTS PARA DELETE /api/avisos/:id ---
    describe('DELETE /api/avisos/:id', () => {

        it('debe eliminar un aviso existente y devolver status 204', async () => {
            // ARRANGE:
            // 1. Simulamos que `destroy` fue exitoso y afectó a 1 fila.
            const destroySpy = jest.spyOn(Aviso, 'destroy').mockResolvedValue(1);
            const avisoId = '123';

            // ACT:
            const res = await request(app).delete(`/api/avisos/${avisoId}`).set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            expect(res.statusCode).toBe(204); // 204 No Content es la respuesta correcta para un DELETE exitoso.
            // Verificamos que se llamó a `destroy` con el ID correcto.
            expect(destroySpy).toHaveBeenCalledWith({ where: { id: avisoId } });
        });

        it('debe devolver status 404 si el aviso a eliminar no se encuentra', async () => {
            // ARRANGE:
            // 1. Simulamos que `destroy` no afectó a ninguna fila (devolvió 0).
            jest.spyOn(Aviso, 'destroy').mockResolvedValue(0);

            // ACT:
            const res = await request(app).delete('/api/avisos/999').set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Aviso no encontrado.');
        });

        it('debe devolver status 500 si ocurre un error en la base de datos al eliminar', async () => {
            // ARRANGE:
            jest.spyOn(Aviso, 'destroy').mockRejectedValue(new Error('Error de conexión'));

            // ACT:
            const res = await request(app).delete('/api/avisos/123').set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Error interno del servidor al eliminar el aviso.');
        });
    });
});