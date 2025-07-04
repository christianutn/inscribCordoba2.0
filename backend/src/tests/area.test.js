import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';

describe('Rutas de tipo de negocio', () => {
    let token_adm;
    let usuarioID_creado

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb();

        // Login para obtener token (ajusta el id_empleado y contraseña según tu base de datos de test)
        const loginRes = await request(app)
            .post('/api/login')
            .send({ cuil: 20378513376, contrasenia: "icba2025" });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body).toHaveProperty('token');
        token_adm = loginRes.body.token;
    });

    

    




    //Consultamos orrigen de prueba
    describe(`GET /api/areas`, () => {
        it('debe devolver 200 todos los usuarios con filtros', async () => {
            const res = await request(app)
                .get(`/api/areas`)
                .set('Authorization', `Bearer ${token_adm}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);

        });

    });

    

    afterAll(async () => {

        await sequelize.close();
    });

});