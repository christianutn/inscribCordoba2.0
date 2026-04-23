import crypto from 'crypto'; // 👈 Asegúrate de importar el módulo 'crypto' si estás en Node.js
import config from '../config/env.config.js';

export default class CidiService {

    constructor() {
        // Credenciales seleccionadas automáticamente según NODE_ENV (vía env.config.js)
        this.CUIL_OPERADOR = config.cidi.cuilOperador;
        this.HASH_COOKIE_OPERADOR = config.cidi.hashCookieOperador;
        this.ID_APLICATION = config.cidi.idApplication;
        this.CONTRASENIA = config.cidi.contrasenia;
        this.KEY_APP = config.cidi.keyApp;
        this.URL_API = config.cidi.urlApi;
        this.URL_API_APP = config.cidi.urlApiApp;
    }

    getTimeStamp() {
        const d = new Date();
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');
        const milliseconds = d.getMilliseconds().toString().padStart(3, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
    }

    generateTokenValue(timeStamp, keyApp) {
        // Asegúrate de que 'crypto' esté importado si estás en un entorno Node.js
        const dataToHash = timeStamp + keyApp.replace(/-/g, ""); // sin guiones
        const hash = crypto.createHash('sha1');
        hash.update(dataToHash, 'utf8');
        return hash.digest('hex').toUpperCase(); // mayúsculas
    }

    async getPersonaEnCidiPor(cuil) {
        try {
            // Obtener el timestamp actual
            const timeStamp = this.getTimeStamp();

            // Generar el valor del token, utilizando this.KEY_APP (corregido)
            const tokenValue = this.generateTokenValue(timeStamp, this.KEY_APP); // 👈 CORRECCIÓN

            // Obtener el CUIL a consultar
            const cuil_a_consultar = cuil;

            // URL del API de consulta
            const url = this.URL_API; // Usamos la propiedad del constructor o la definimos aquí

            // Enviar solicitud POST
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    TimeStamp: timeStamp,
                    TokenValue: tokenValue,
                    // Accedemos a las propiedades de la clase usando 'this.' (CORREGIDO)
                    CUIL_OPERADOR: this.CUIL_OPERADOR,
                    HASH_COOKIE_OPERADOR: this.HASH_COOKIE_OPERADOR,
                    IdAplicacion: this.ID_APLICATION,
                    Contrasenia: this.CONTRASENIA,
                    CUIL: cuil_a_consultar
                })
            });


            // Comprobar si la respuesta es exitosa
            if (!response.ok) {
                // Intenta leer el cuerpo del error solo si está disponible
                const contentType = response.headers.get("content-type");
                let errorMessage = `Error HTTP: ${response.status}`;

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json().catch(() => ({}));
                    errorMessage = errorData.message || errorMessage;
                }

                throw new Error(errorMessage);
            }

            // Parsear la respuesta en formato JSON
            const data = await response.json();

            return data;
        } catch (error) {
            // Manejo de errores
            console.error("Error al obtener persona en CIDI:", error.message); // 👈 Opcional: agregar un log
            throw error;
        }
    };
    async obtenerUsuarioAplicacion(hashCookie) {
        try {
            // Obtener el timestamp actual
            const timeStamp = this.getTimeStamp();

            // Generar el valor del token, utilizando this.KEY_APP (corregido)
            const tokenValue = this.generateTokenValue(timeStamp, this.KEY_APP); // 👈 CORRECCIÓN

            // URL del API de consulta (seleccionada según entorno vía env.config.js)
            const url = this.URL_API_APP;

            // Enviar solicitud POST
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    IdAplicacion: this.ID_APLICATION,
                    Contrasenia: this.CONTRASENIA,
                    HashCookie: hashCookie,
                    TokenValue: tokenValue,
                    TimeStamp: timeStamp,
                    CUIL: null
                })
            });

            // Parsear la respuesta en formato JSON
            const data = await response.json();

            if (data.Respuesta.Resultado != "OK") {
                throw new Error("No autenticado en CIDI");
            }

            return data;
        } catch (error) {
            // Manejo de errores
            console.error("Error al obtener persona en CIDI:", error.message); // 👈 Opcional: agregar un log
            throw error;
        }
    };
}


