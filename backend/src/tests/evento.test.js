import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';

describe('Rutas de eventos', () => {
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

    describe('GET /api/eventos', () => {
        it('debe devolver 200 y un array de eventos', async () => {
            const res = await request(app)
                .get('/api/eventos')
                .set('Authorization', `Bearer ${token_adm}`);
            expect(res.statusCode).toBe(200);

        });



    });

    // Validamos ruta /api/eventos/:id

    //Validamos ruta POST /api/eventos
    describe('POST /api/eventos', () => {

        it('debe devolver 200 y un area', async () => {
            const res = await request(app)
                .post('/api/eventos')
                .set('Authorization', `Bearer ${token_adm}`)
                .send({curso: "CTESST", perfil: "ONG", area_tematica: "TE", tipo_certificacion: "CAP", presentacion: "test", objetivos: "test", requisitos_aprobacion : "test",  ejes_tematicos: "test", certifica_en_cc: 1,  disenio_a_cargo_cc: 1 });
            expect(res.statusCode).toBe(201);
            objectCreacion = res.body;
        });

        // // Error por que el eventos 
        // it('debe devolver 400 cuando un atributo es inválido', async () => {
        //     const res = await request(app)
        //         .post(`/api/eventos`)
        //         .set('Authorization', `Bearer ${token_adm}`)
        //         .send({ nombre: "", cod: ""});
        //     expect(res.statusCode).toBe(400);
        // });

    })


    describe('DELETE /api/eventos/:curso', () => {
        it('debe devolver 201', async () => {
            const res = await request(app)
                .delete(`/api/eventos/${objectCreacion.curso}`)
                .set('Authorization', `Bearer ${token_adm}`)
            expect(res.statusCode).toBe(200);
        });
    })

});