import crypto from "crypto";
import 'dotenv/config';

function getTimeStamp() {
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

function generateTokenValue(timeStamp, keyApp) {
    const dataToHash = timeStamp + keyApp.replace(/-/g, ""); // sin guiones
    const hash = crypto.createHash('sha1');
    hash.update(dataToHash, 'utf8');
    return hash.digest('hex').toUpperCase(); // mayúsculas
}





export const getCuilPorCidi = async (req, res, next) => {
    try {
        // Obtener el timestamp actual
        const timeStamp = getTimeStamp();
        
        // Variables de entorno
        const CUIL_OPERADOR = process.env.CUIL_OPERADOR_TEST;
        const HASH_COOKIE_OPERADOR = process.env.HASH_COOKIE_OPERADOR_TEST;
        const ID_APLICATION = process.env.ID_APLICATION_TEST;
        const CONTRASENIA = process.env.CONTRASENIA_TEST;
        const KEY_APP = process.env.KEY_APP_TEST;
        

        console.log("CUILoperador:", CUIL_OPERADOR);
        
        
        // Generar el valor del token
        const tokenValue = generateTokenValue(timeStamp, KEY_APP);
        
        // Obtener el CUIL a consultar desde los parámetros de la solicitud
        const cuil_a_consultar = req.params.cuil;

        // URL del API de consulta
        const url_test = "https://cuentacidi.test.cba.gov.ar/api/Usuario/Obtener_Usuario";
        
        // Enviar solicitud POST, ya que estamos incluyendo un cuerpo
        const response = await fetch(url_test, {
            method: "POST",  // Cambié GET por POST
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                TimeStamp: timeStamp,
                TokenValue: tokenValue,
                CUIL_OPERADOR: CUIL_OPERADOR,
                HASH_COOKIE_OPERADOR: HASH_COOKIE_OPERADOR,
                IdAplicacion: ID_APLICATION,
                Contrasenia: CONTRASENIA,
                CUIL: cuil_a_consultar
            })
        });

        console.log("TimeStamp:", timeStamp);
        console.log("TokenValue:", tokenValue);
        console.log("CUIL_OPERADOR:", CUIL_OPERADOR);
        console.log("HASH_COOKIE_OPERADOR:", HASH_COOKIE_OPERADOR);
        console.log("IdAplicacion:", ID_APLICATION);
        console.log("Contrasenia:", CONTRASENIA);
        console.log("CUIL:", cuil_a_consultar);



        // Comprobar si la respuesta es exitosa
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }

        // Parsear la respuesta en formato JSON
        const data = await response.json();

        // Devolver la respuesta en formato JSON
        res.status(200).json(data);
    } catch (error) {
        // Manejo de errores y paso al siguiente middleware
        next(error);
    }
};

