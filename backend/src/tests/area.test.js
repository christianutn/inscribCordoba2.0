import request from 'supertest';
import { app, initDb } from '../index.js';
import sequelize from '../config/database.js';

describe('Rutas de Areas', () => {
    let token_adm;
    let areaId_creado = 0;

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

    describe('GET /api/areas', () => {
        it('debe devolver 200 y un array de areas', async () => {
            const res = await request(app)
                .get('/api/areas')
                .set('Authorization', `Bearer ${token_adm}`);
            expect(res.statusCode).toBe(200);

        });



    });

    // Validamos ruta /api/areas/:id

    //Validamos ruta POST /api/areas
    describe('POST /api/areas', () => {

        it('debe devolver 201 y un area', async () => {
            const res = await request(app)
                .post('/api/areas')
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ nombre: "Area de test", cod: "TEST9912", ministerio: "MTEST" });
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('nombre');
            expect(res.body).toHaveProperty('cod');
            expect(res.body).toHaveProperty('ministerio');
            areaId_creado = res.body.cod;
            console.log("areaId_creado:", areaId_creado);
        });

        // // Error por que el abono ya existe
        it('debe devolver 400 cuando un atributo es inválido', async () => {
            const res = await request(app)
                .post(`/api/areas`)
                .set('Authorization', `Bearer ${token_adm}`)
                .send({ nombre: "test", cod: `${areaId_creado}`});
            expect(res.statusCode).toBe(400);
            //expect(res.body).toHaveProperty('message');
        });


    })

    // Validamos ruta PUT /api/areas
    // describe('PUT /api/areas', () => {
    //     it('debe devolver 201 y un abono', async () => {
    //         const res = await request(app)
    //             .post('/api/areas')
    //             .set('Authorization', `Bearer ${token_adm}`)
    //             .send({ nombre: "Areas de prueba sss", cod: `${areaId_creado}`, ministerio: "MTEST", newCod: `${areaId_creado}`, esVigente: 1 });
    //         expect(res.statusCode).toBe(200);
    //             //expect(res.body).toHaveProperty('success').toBe(true);
    //     });

    //     // Error por que el abono ya existe
    //     it('debe devolver 400 cuando un atributo es inválido', async () => {
    //         const res = await request(app)
    //             .put(`/api/areas`)
    //             .set('Authorization', `Bearer ${token_adm}`)
    //             .send(
    //                 {
    //                     cod: "ATD",
    //                     nombre: "",
    //                     ministerio: "MS",
    //                     newCod: "ATD"
    //                 }
    //             );
    //         expect(res.statusCode).toBe(400);
    //         //expect(res.body).toHaveProperty('message');
    //     });

    // })

    describe('DELETE /api/areas/:cod', () => {
        it('debe devolver 201', async () => {
            const res = await request(app)
                .delete(`/api/areas/${areaId_creado}`)
                .set('Authorization', `Bearer ${token_adm}`)
            expect(res.statusCode).toBe(200);
        });
    })



});