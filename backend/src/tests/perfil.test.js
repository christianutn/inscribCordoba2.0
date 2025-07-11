import request from 'supertest';
import sequelize from '../config/database.js'; 
import { app, initDb } from '../index.js';
import Perfil from '../models/perfil.models.js';

// --- EL MOCK PARA PASSPORT.JS ---
// Le decimos a Jest que intercepte cualquier importación de 'passport'.
jest.mock('passport', () => ({
    // Devolvemos un objeto que simula ser la librería 'passport'.
    // La clave es el método 'authenticate'.
    authenticate: jest.fn((strategy, options) => {
        // passport.authenticate() devuelve una función middleware (req, res, next).
        // Nosotros tenemos que devolver nuestra propia función middleware falsa.
        return (req, res, next) => {
            // Aquí simulamos un usuario autenticado exitosamente.
            // El objeto que adjuntamos a 'req.user' debe tener la misma
            // estructura que el payload de tu token real.
            // Basado en tu jwt.js, la estructura es { user: { ... } }
            req.user = {
                user: {
                    cuil: '20378513376', // Dato de prueba
                    nombre: 'Usuario',    // Dato de prueba
                    apellido: 'Mockeado', // Dato de prueba
                    rol: 'ADM'         // Dato de prueba importante para roles
                }
            };
            // Muy importante: llamamos a next() para pasar al siguiente
            // middleware en la cadena, que es tu controlador real.
            next();
        };
    }),
    // También mockeamos 'initialize' y 'use' porque se llaman al iniciar la app.
    // No necesitan hacer nada, solo existir.
    initialize: jest.fn(),
    use: jest.fn(),
}));


describe('Pruebas de API Endpoints', () => {

    let token_adm;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        await initDb(); 

        // Eliminamos la llamada real a la API de login. Ya no es necesaria.
        // Asignamos un valor falso, aunque su contenido ya no importa.
        token_adm = 'este-token-ya-no-se-verifica';
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // --- TESTS PARA PERFILES ---
    // ¡No necesitas cambiar absolutamente nada aquí! Siguen funcionando igual.
    describe('Rutas de Perfiles', () => {

        describe('GET /api/perfiles', () => {
            it('debe devolver una lista de perfiles ordenada por código con status 200', async () => {
                const mockPerfiles = [
                    { cod: 'ADM', nombre: 'Administrador' },
                    { cod: 'USR', nombre: 'Usuario' }
                ];
                const findAllSpy = jest.spyOn(Perfil, 'findAll').mockResolvedValue(mockPerfiles);

                const res = await request(app)
                    .get('/api/perfiles')
                    // Aunque el token ya no se verifica, es buena práctica seguir enviando el header
                    // por si alguna otra parte del código lo espera.
                    .set('Authorization', `Bearer ${token_adm}`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual(mockPerfiles);
                expect(findAllSpy).toHaveBeenCalledWith({ order: [['cod', 'ASC']] });

                findAllSpy.mockRestore();
            });
        });

        describe('GET /api/perfiles/:cod', () => {
            it('debe devolver un perfil específico por su código con status 200', async () => {
                const testCod = 'ADM';
                const mockPerfil = { cod: 'ADM', nombre: 'Administrador' };
                const findOneSpy = jest.spyOn(Perfil, 'findOne').mockResolvedValue(mockPerfil);

                const res = await request(app)
                    .get(`/api/perfiles/${testCod}`)
                    .set('Authorization', `Bearer ${token_adm}`); // <-- Sigue enviando el token falso

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual(mockPerfil);

                findOneSpy.mockRestore();
            });
           
        });
    });

    
});