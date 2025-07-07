import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';

describe('Rutas de cursos', () => {
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

    describe('GET /api/cursos', () => {
        it('debe devolver 200 y un array de cursos', async () => {
            const res = await request(app)
                .get('/api/cursos')
                .set('Authorization', `Bearer ${token_adm}`);
            expect(res.statusCode).toBe(200);
            expect()

        });



    });

    // Validamos ruta /api/cursos/:id

    //Validamos ruta POST /api/cursos
    describe('POST /api/cursos', () => {

        it('debe devolver 200 y un area', async () => {
            const res = await request(app)
                .post('/api/cursos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ cod: "TESTJEST", nombre: "Test jest", cupo: "10", cantidad_horas: "10", medio_inscripcion: "PCC", plataforma_dictado: "CC", tipo_capacitacion: "EL", area: "TEST" });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('cod');
            expect(res.body).toHaveProperty('nombre');
            expect(res.body).toHaveProperty('area');
            objectCreacion = res.body;
        });

        // // Error por que el cursos 
        it('debe devolver 400 cuando un atributo es inválido', async () => {
            const res = await request(app)
                .post(`/api/cursos`)
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ nombre: "", cod: ""});
            expect(res.statusCode).toBe(400);
        });

    })


    describe('DELETE /api/cursos/:cod', () => {
        it('debe devolver 201', async () => {
            const res = await request(app)
                .delete(`/api/cursos/${objectCreacion.cod}`)
                .set('Authorization', `Bearer ${token_adm}`)
            expect(res.statusCode).toBe(200);
        });
    })

});