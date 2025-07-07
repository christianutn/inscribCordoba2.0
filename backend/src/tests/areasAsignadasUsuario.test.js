import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';

describe('Rutas de Areas', () => {
    let token_adm;
    let objectCreacion = 0;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();

        // Login para obtener token (ajusta el id_empleado y contraseña según tu base de datos de test)
        const loginRes = await request(app)
            .post('/api/login')
            .send({ cuil: "20378513376", contrasenia: "icba2025" });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body).toHaveProperty('token');
        token_adm = loginRes.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /api/areasAsignadasUsuario', () => {
        it('debe devolver 200 y un array de areas', async () => {
            const res = await request(app)
                .get('/api/areasAsignadasUsuario')
                .set('Authorization', `Bearer ${token_adm}`);
            expect(res.statusCode).toBe(200);
            expect()

        });

    });

     //Validamos ruta POST /api/areasAsignadasUsuario
    describe('POST /api/areasAsignadasUsuario', () => {

        it('debe devolver 201 y un area', async () => {
            const res = await request(app)
                .post('/api/areasAsignadasUsuario')
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ cuil_usuario: "20378513376", cod_area: "TEST", comentario: "test" });
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('usuario');
            expect(res.body).toHaveProperty('area');
            expect(res.body).toHaveProperty('comentario');
            objectCreacion = res.body;
            console.log("USUARIO: ", objectCreacion)
        });

        // Error por atributos inválidos
        it('debe devolver 400 cuando un atributo es inválido', async () => {
            const res = await request(app)
                .post(`/api/areasAsignadasUsuario`)
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ nombre: "", cod: "" });
            expect(res.statusCode).toBe(400);
        });

    })


    describe('DELETE /api/areasAsignadasUsuario/:usuario/:area', () => {
        it('debe devolver 200', async () => {
            const res = await request(app)
                .delete(`/api/areasAsignadasUsuario/${objectCreacion.usuario}/${objectCreacion.area}`)
                .set('Authorization', `Bearer ${token_adm}`)
            expect(res.statusCode).toBe(200);
        });

        it('debe devolver 404', async () => {
            const res = await request(app)
                .delete(`/api/areasAsignadasUsuario/${objectCreacion.usuario}/unCodQueNoExiste`)
                .set('Authorization', `Bearer ${token_adm}`)
            expect(res.statusCode).toBe(404);
        });

    })


   

});