import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';

describe('Rutas de avisos', () => {
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

    describe('GET /api/avisos', () => {
        it('debe devolver 200 y un array de avisos', async () => {
            const res = await request(app)
                .get('/api/avisos')
                .set('Authorization', `Bearer ${token_adm}`);
            expect(res.statusCode).toBe(200);
            expect()

        });



    });

    // Validamos ruta /api/avisos/:id

    //Validamos ruta POST /api/avisos
    describe('POST /api/avisos', () => {

        it('debe devolver 201 y un area', async () => {
            const res = await request(app)
                .post('/api/avisos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ titulo: "test", contenido: "test", icono: "", visible: 1});
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('titulo');
            expect(res.body).toHaveProperty('contenido');
            expect(res.body).toHaveProperty('visible');
            objectCreacion = res.body;
        });


    })


    describe('DELETE /api/avisos/:id', () => {
        it('debe devolver 204', async () => {
            const res = await request(app)
                .delete(`/api/avisos/${objectCreacion.id}`)
                .set('Authorization', `Bearer ${token_adm}`)
            expect(res.statusCode).toBe(204);
        });


    })

});