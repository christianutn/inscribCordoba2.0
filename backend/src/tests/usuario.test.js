import request from 'supertest';
import sequelize from '../config/database.js';
import { app, initDb } from '../index.js';
import Usuario from '../models/usuario.models.js';
import Persona from '../models/persona.models.js';

// --- MOCK DE DEPENDENCIAS GLOBALES ---
// --- MOCK DE AUTENTICACIÓN ---
jest.mock('passport', () => ({
    authenticate: jest.fn((strategy, options) => (req, res, next) => {
        // Por defecto, usa un ADM, pero los tests pueden sobreescribir req.user
        if (!req.user) {
            req.user = { user: { cuil: '20378513376', nombre: 'Admin', rol: 'ADM' } };
        }
        next();
    }),
    initialize: jest.fn(),
    use: jest.fn(),
}));


jest.mock('../utils/validarCuil.js', () => jest.fn(() => true));
jest.mock('../utils/validarMail.js', () => jest.fn(() => true));
jest.mock('../utils/tratarNombres.js', () => jest.fn(nombre => nombre));
// Asegúrate de que este es el mock que tienes. Debe incluir AMBAS funciones.
jest.mock('../utils/bcrypt.js', () => ({
    createHash: jest.fn(password => `hashed_${password}`),
}));
jest.mock('../utils/jwt.js', () => jest.fn(() => 'mocked_jwt_token'));
jest.mock('../utils/enviarCorreo.js', () => jest.fn().mockResolvedValue(true));
jest.mock('../utils/parseEsExcepcionParaFechas.js', () => jest.fn(value => value));

// Importar utilidades mockeadas para poder espiarlas si es necesario
import validarCuil from '../utils/validarCuil.js';
import enviarCorreo from '../utils/enviarCorreo.js';

describe('Rutas de Usuarios (con Auth Mockeada)', () => {

    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();
        token_adm = 'mocked-auth-token';
    });

    afterEach(() => {
        // Limpia todos los mocks después de cada test para evitar interferencias
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA GET /api/usuarios ---
    describe('GET /api/usuarios', () => {
        it('debe devolver todos los usuarios con sus detalles', async () => {
            const mockUsuarios = [{ cuil: '20111111111', rol: 'ADM' }];
            const findAllSpy = jest.spyOn(Usuario, 'findAll').mockResolvedValue(mockUsuarios);

            const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockUsuarios);
            expect(findAllSpy).toHaveBeenCalledWith(expect.objectContaining({ include: expect.any(Array) }));
        });

        it('debe devolver un error 404 si no existen usuarios', async () => {
            jest.spyOn(Usuario, 'findAll').mockResolvedValue([]);

            const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No existen usuarios');
        });
    });


    // --- TESTS PARA PUT /api/usuarios ---
    describe('PUT /api/usuarios', () => {
        const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
        const updateData = { cuil: '20111111111', nombre: 'Juan', apellido: 'Perez', mail: 'a@a.com', rol: 'ADM', area: 'SYS' };

        beforeEach(() => {
            mockTransaction.commit.mockClear();
            mockTransaction.rollback.mockClear();
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(mockTransaction);
        });

        it('debe actualizar un usuario y hacer commit de la transacción', async () => {
            jest.spyOn(Persona, 'update').mockResolvedValue([1]);
            jest.spyOn(Usuario, 'update').mockResolvedValue([1]);

            const res = await request(app).put('/api/usuarios').set('Authorization', `Bearer ${token_adm}`).send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Usuario actualizado correctamente');
            expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
        });

        it('debe hacer rollback si no se actualiza ningún dato', async () => {
            jest.spyOn(Persona, 'update').mockResolvedValue([0]);
            jest.spyOn(Usuario, 'update').mockResolvedValue([0]);

            const res = await request(app).put('/api/usuarios').set('Authorization', `Bearer ${token_adm}`).send(updateData);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No se encontraron datos para actualizar');
            expect(mockTransaction.commit).not.toHaveBeenCalled();
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
        });

        it('debe hacer rollback si falla la validación del CUIL', async () => {
            validarCuil.mockReturnValue(false); // Forzamos el fallo de la validación

            const res = await request(app).put('/api/usuarios').set('Authorization', `Bearer ${token_adm}`).send(updateData);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('El CUIL no es válido');
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    // --- TESTS PARA DELETE /api/usuarios/:cuil ---
    describe('DELETE /api/usuarios/:cuil', () => {
        it('debe eliminar un usuario correctamente', async () => {
            const destroySpy = jest.spyOn(Usuario, 'destroy').mockResolvedValue(1);

            const res = await request(app).delete('/api/usuarios/20111111111').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Usuario eliminado correctamente');
            expect(destroySpy).toHaveBeenCalledWith({ where: { cuil: '20111111111' } });
        });

        it('debe devolver un error 404 si el usuario a eliminar no se encuentra', async () => {
            jest.spyOn(Usuario, 'destroy').mockResolvedValue(0);

            const res = await request(app).delete('/api/usuarios/20111111111').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No se encontraron datos para eliminar');
        });
    });

    // --- TESTS PARA GET /api/usuarios/myUser ---
    describe('GET /api/usuarios/myUser', () => {
        it('debe devolver los datos del usuario autenticado desde el token', async () => {
            const res = await request(app).get('/api/usuarios/myUser').set('Authorization', `Bearer ${token_adm}`);

            expect(res.statusCode).toBe(200);
            // El mock de passport define a req.user.user
            expect(res.body).toEqual({ cuil: '20378513376', nombre: 'Admin', rol: 'ADM' });
        });
    });

    // --- TESTS PARA POST /api/usuarios ---
    describe('POST /api/usuarios', () => {

        it('debe crear un nuevo usuario correctamente y devolverlo', async () => {
            // ARRANGE: Preparamos los datos y los mocks
            const datosEntrada = {
                cuil: '20222222222',
                contrasenia: '1234',
                rol: 'ADM',
                area: 'TEST'
            };

            // Este es el objeto que esperamos que devuelva la llamada a Usuario.create
            const usuarioCreadoMock = {
                ...datosEntrada,
                necesitaCbioContrasenia: "1" // El controlador lo hardcodea como STRING
            };

            // Configuramos los mocks para el "camino feliz"
            jest.spyOn(Persona, 'findOne').mockResolvedValue({ cuil: '20222222222' }); // Simulamos que la persona sí existe
            jest.spyOn(Usuario, 'findOne').mockResolvedValue(null); // Simulamos que el usuario NO existe todavía
            const createSpy = jest.spyOn(Usuario, 'create').mockResolvedValue(usuarioCreadoMock); // Espiamos y mockeamos la creación

            // ACT: Hacemos la llamada a la API
            const res = await request(app)
                .post('/api/usuarios/registrar')
                .set('Authorization', `Bearer ${token_adm}`)
                .send(datosEntrada);

            // ASSERT: Verificamos los resultados
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(usuarioCreadoMock); // El cuerpo de la respuesta debe ser el usuario creado

            // // La verificación más importante: ¿se llamó a create con los datos correctos?
            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(createSpy).toHaveBeenCalledWith({
                cuil: '20222222222',
                contrasenia: 'hashed_1234', // Verificamos que se usó la contraseña hasheada por nuestro mock de bcrypt
                rol: 'ADM',
                area: 'TEST',
                necesitaCbioContrasenia: "1" // Verificamos que se hardcodeó el valor correcto
            });
        });

    });

    // --- TESTS PARA POST /api/usuarios/contrasenia ---
    describe('POST /api/usuarios/contrasenia', () => {

        it('debe actualizar la contraseña del usuario autenticado correctamente', async () => {
            // ARRANGE
            const updateSpy = jest.spyOn(Usuario, 'update').mockResolvedValue([1]);

            // ACT: CORRECCIÓN DE RUTA
            const res = await request(app)
                .put('/api/usuarios/contrasenia')
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ nuevaContrasenia: 'new_pass_123' });

            // ASSERT
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Contraseña actualizada correctamente');
            expect(updateSpy).toHaveBeenCalledWith(
                {
                    contrasenia: 'hashed_new_pass_123',
                    necesitaCbioContrasenia: 0
                },
                {
                    where: { cuil: '20378513376' }
                }
            );
        });

        it('debe devolver un error 404 si el usuario a actualizar no se encuentra', async () => {
            // ARRANGE
            jest.spyOn(Usuario, 'update').mockResolvedValue([0]);

            // ACT: CORRECCIÓN DE RUTA
            const res = await request(app)
                .put('/api/usuarios/contrasenia')
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ nuevaContrasenia: 'new_pass_123' });

            // ASSERT
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No se encontraron datos para actualizar');
        });

        it('debe devolver un error 500 si la actualización de la base de datos falla', async () => {
            // ARRANGE
            const dbError = new Error('Error de conexión a la base de datos');
            jest.spyOn(Usuario, 'update').mockRejectedValue(dbError);

            // ACT: CORRECCIÓN DE RUTA
            const res = await request(app)
                .put('/api/usuarios/contrasenia')
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ nuevaContrasenia: 'new_pass_123' });

            // ASSERT
            expect(res.statusCode).toBe(500);
        });
    });

//     // --- TESTS PARA POST /api/usuarios/recuperoContrasenia ---
// Dejamos pendiente para pruebas
//     describe('POST /api/usuarios/recuperoContrasenia', () => {

//         it('debe enviar un correo de recuperación y devolver un mensaje de éxito si la persona existe', async () => {
//             // ARRANGE:
//             // 1. Simulamos que la persona con el CUIL proporcionado sí existe en la base de datos.
//             const userEmail = 'test@example.com';
//             jest.spyOn(Persona, 'findOne').mockResolvedValue({ cuil: '20111111111', mail: userEmail });

//             // ACT:
//             // 2. Hacemos la petición a la API.
//             const res = await request(app)
//                 .put('/api/usuarios/recuperoContrasenia')
//                 .send({ cuil: '20111111111' });

//             // ASSERT:
//             // 3. Verificamos los resultados del "camino feliz".
//             expect(res.statusCode).toBe(200);
//             expect(res.body.message).toBe('Correo de recuperación enviado');
//             // Verificamos que el email se enmascaró correctamente en la respuesta.
//             expect(res.body.cuilRecovery).toBe('t**t@e*****.com');
//             // Verificamos que la función de enviar correo fue llamada.
//             expect(enviarCorreo).toHaveBeenCalledTimes(1);
//         });

//         it('debe devolver un mensaje genérico de éxito si la persona NO existe, para no revelar información', async () => {
//             // ARRANGE:
//             // 1. Simulamos que la persona NO existe. Persona.findOne devuelve null.
//             jest.spyOn(Persona, 'findOne').mockResolvedValue(null);

//             // ACT:
//             const res = await request(app)
//                 .put('/api/usuarios/recuperoContrasenia')
//                 .send({ cuil: '20111111111' });

//             // ASSERT:
//             // 2. La respuesta debe ser idéntica a la de éxito para no dar pistas.
//             expect(res.statusCode).toBe(200);
//             expect(res.body.message).toBe('Correo de recuperación enviado');
//             // 3. La verificación crucial: NO se debe haber intentado enviar un correo.
//             expect(enviarCorreo).not.toHaveBeenCalled();
//         });

//         it('debe devolver un error 400 si el CUIL proporcionado no es válido', async () => {
//             // ARRANGE:
//             // 1. Sobreescribimos el mock global de validarCuil solo para este test.
//             validarCuil.mockReturnValue(false);

//             // ACT:
//             const res = await request(app)
//                 .put('/api/usuarios/recuperoContrasenia')
//                 .send({ cuil: '12345' }); // Un cuil inválido

//             // ASSERT:
//             // 2. Verificamos la respuesta de error de validación.
//             expect(res.statusCode).toBe(400);
//             expect(res.body.message).toBe('El CUIL no es válido');
//         });

//         it('debe manejar errores internos si falla el envío de correo', async () => {
//             // ARRANGE:
//             // 1. Simulamos que la persona existe...
//             jest.spyOn(Persona, 'findOne').mockResolvedValue({ cuil: '20111111111', mail: 'test@example.com' });
//             // 2. ...pero el servicio de email falla.
//             const mailError = new Error("El servicio de correo no responde");
//             enviarCorreo.mockRejectedValue(mailError);

//             // ACT:
//             const res = await request(app)
//                 .put('/api/usuarios/recuperoContrasenia')
//                 .send({ cuil: '20111111111' });

//             // ASSERT:
//             // 3. El error debe ser capturado y resultar en un 500.
//             expect(res.statusCode).toBe(500);
//         });
//     });
});