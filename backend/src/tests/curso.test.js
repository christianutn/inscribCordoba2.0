import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';
import Curso from '../models/curso.models.js';
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

describe('Rutas de cursos', () => {
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


    describe('GET /api/cursos', () => {

        const mockCursos = [
            {
                cod: "TESTJEST",
                nombre: "Test jest",
                cupo: "10",
                cantidad_horas: "10",
            }
        ]

        const findAllSpy = jest.spyOn(Curso, 'findAll').mockResolvedValue(mockCursos);
        it('debe devolver 200 y un array de cursos', async () => {
            const res = await request(app)
                .get('/api/cursos')
                .set('Authorization', `Bearer ${token_adm}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockCursos);
            expect(findAllSpy).toHaveBeenCalledTimes(1);

        });
    });

    // --- TEST POST CURSO

    describe('POST /api/cursos', () => {

        const mockCurso = {
            cod: "C-MRSES",
            nombre: "Manejo de redes sociales para la economía social",
            cupo: 110,
            cantidad_horas: 50,
            medio_inscripcion: "FUP",
            plataforma_dictado: "CC",
            tipo_capacitacion: "EL",
            area: "SES",
            tiene_evento_creado: 1
        }

        const createSpy = jest.spyOn(Curso, 'create').mockResolvedValue(mockCurso);
        const findOneSpy = jest.spyOn(Curso, 'findOne').mockResolvedValue(null);

        it('debe devolver 200 y un area', async () => {
            const res = await request(app)
                .post('/api/cursos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(mockCurso);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('cod');
            expect(res.body).toHaveProperty('nombre');
            expect(res.body).toHaveProperty('cupo');
            expect(res.body).toHaveProperty('cantidad_horas');
            expect(res.body).toHaveProperty('medio_inscripcion');

            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(findOneSpy).toHaveBeenCalledTimes(1);

        });
    });

    // --- TESTS PARA PUT /api/cursos ---
    describe('PUT /api/cursos', () => {
        // Objeto mock para la transacción. Lo definimos aquí para tenerlo disponible en todos los tests.
        const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

        // Datos de actualización que enviaremos en el body.
        const updateData = {
            cod: "C-JEST",
            nombre: "Curso Actualizado",
            cupo: 150,
            cantidad_horas: 25,
            medio_inscripcion: "PCC",
            plataforma_dictado: "CC",
            tipo_capacitacion: "EL",
            area: 'UPD',
            esVigente: 'Si',
            tiene_evento_creado: "Si"
        };

        // beforeEach se ejecuta ANTES de cada 'it' en este bloque 'describe'.
        // Es el lugar perfecto para resetear los mocks y asegurar que cada test es independiente.
        beforeEach(() => {
            mockTransaction.commit.mockClear();
            mockTransaction.rollback.mockClear();
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);
        });

        it('debe actualizar un curso correctamente y hacer commit de la transacción', async () => {
            // ARRANGE: Preparamos el escenario de éxito.
            // 1. Simulamos que el curso a actualizar SÍ existe.
            jest.spyOn(Curso, 'findOne').mockResolvedValue({ cod: 'C-JEST' });
            // 2. Simulamos que la operación de update fue exitosa (afectó a 1 fila).
            const updateSpy = jest.spyOn(Curso, 'update').mockResolvedValue([1]);

            // ACT: Hacemos la llamada a la API con los datos a actualizar.
            const res = await request(app)
                .put('/api/cursos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            // ASSERT: Verificamos los resultados.
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Se actualizo correctamente el curso");

            // Verificamos que se llamó a 'update' con los datos correctos y la transacción.
            expect(updateSpy).toHaveBeenCalledWith(expect.any(Object), {
                where: { cod: updateData.cod },
                transaction: mockTransaction // <-- Muy importante: confirma que la tx se está usando.
            });

            // Verificamos el manejo de la transacción.
            expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
        });

        it('debe hacer rollback si el curso a actualizar no se encuentra', async () => {
            // ARRANGE: Simulamos que findOne NO encuentra el curso.
            jest.spyOn(Curso, 'findOne').mockResolvedValue(null);

            // ACT:
            const res = await request(app)
                .put('/api/cursos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            // ASSERT:
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe(`No se encontró un curso con el código ${updateData.cod}`);

            // Verificamos que se revirtió la transacción.
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
            expect(mockTransaction.commit).not.toHaveBeenCalled();
        });

        it('debe hacer rollback si la actualización no afecta a ninguna fila', async () => {
            // ARRANGE:
            // El curso se encuentra, pero por alguna razón (ej. no hay cambios), el update no afecta filas.
            jest.spyOn(Curso, 'findOne').mockResolvedValue({ cod: 'C-JEST' });
            jest.spyOn(Curso, 'update').mockResolvedValue([0]); // <--- Simulamos 0 filas afectadas.

            // ACT:
            const res = await request(app)
                .put('/api/cursos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(updateData);

            // ASSERT:
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("No hubo actualización de datos");
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
        });

    });

    // --- TESTS PARA DELETE /api/cursos/:cod ---
    describe('DELETE /api/cursos/:cod', () => {

        it('debe eliminar un curso correctamente y devolver un mensaje de éxito', async () => {
            // ARRANGE:
            // 1. Definimos el código del curso que simularemos eliminar.
            const codParaEliminar = 'C-DELETE-ME';

            // 2. Espiamos el método `destroy` del modelo Curso.
            //    Simulamos un resultado exitoso: destroy devuelve 1 (1 fila afectada).
            const destroySpy = jest.spyOn(Curso, 'destroy').mockResolvedValue(1);

            // ACT:
            // 3. Hacemos la petición DELETE a la ruta, incluyendo el 'cod' en los params.
            const res = await request(app)
                .delete(`/api/cursos/${codParaEliminar}`)
                .set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            // 4. Verificamos que la respuesta es la esperada.
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Se borro correctamente el curso");

            // 5. La verificación más importante: nos aseguramos de que el controlador
            //    llamó a `destroy` con la cláusula `WHERE` correcta.
            expect(destroySpy).toHaveBeenCalledTimes(1);
            expect(destroySpy).toHaveBeenCalledWith({
                where: {
                    cod: codParaEliminar
                }
            });
        });

        it('debe devolver un error 400 si el curso a eliminar no se encuentra', async () => {
            // ARRANGE:
            // 1. Definimos el código de un curso que no existe.
            const codQueNoExiste = 'C-NOT-FOUND';

            // 2. Simulamos el caso de fallo: `destroy` devuelve 0 (0 filas afectadas).
            jest.spyOn(Curso, 'destroy').mockResolvedValue(0);

            // ACT:
            // 3. Hacemos la petición DELETE.
            const res = await request(app)
                .delete(`/api/cursos/${codQueNoExiste}`)
                .set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            // 4. Verificamos que el servidor responde con el error que definimos en el controlador.
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("No se pudo borrar el curso");
        });

        it('debe manejar errores inesperados de la base de datos', async () => {
            // ARRANGE:
            // 1. Simulamos un error catastrófico, como una desconexión de la base de datos.
            const dbError = new Error("Error de conexión");
            jest.spyOn(Curso, 'destroy').mockRejectedValue(dbError);

            // ACT:
            const res = await request(app)
                .delete('/api/cursos/C-ANY')
                .set('Authorization', `Bearer ${token_adm}`);

            // ASSERT:
            // 3. Verificamos que nuestro manejador de errores de Express captura el
            //    error y devuelve un 500 (Internal Server Error).
            expect(res.statusCode).toBe(500);
        });
    });

});