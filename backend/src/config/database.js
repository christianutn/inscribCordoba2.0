import { Sequelize } from "sequelize";
import 'dotenv/config';


let DB_NAME;
let DB_USER;
let DB_PASSWORD;
let DB_HOST;
let DB_PORT;

console.log("NODE_ENV: ", process.env.NODE_ENV);

if (process.env.NODE_ENV == "production") {
  console.log("Es variable de entorno  para Production");
  DB_NAME = process.env.DB_NAME_PROD;
  DB_USER = process.env.DB_USER_PROD;
  DB_PASSWORD = process.env.DB_PASSWORD_PROD;
  DB_HOST = process.env.DB_HOST_PROD;
  DB_PORT = process.env.DB_PORT_PROD;
} else if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test") {
  console.log("Es variable de entorno  para Desarrollo/Test");
  DB_NAME = process.env.DB_NAME_DESARROLLO;
  DB_USER = process.env.DB_USER_DESARROLLO;
  DB_PASSWORD = process.env.DB_PASSWORD_DESARROLLO;
  DB_HOST = process.env.DB_HOST_DESARROLLO;
  DB_PORT = process.env.DB_PORT_DESARROLLO;

}



const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  port: DB_PORT,
  timezone: '-03:00', // Zona horaria de Argentina (ART)
  dialectOptions: {
    ssl: {
      require: true, // Requiere SSL para la conexión
      rejectUnauthorized: false // Permitir conexiones SSL no autorizadas
    },
    // Evitar que mysql2 convierta DATE/DATETIME a objetos Date de JS
    // Esto previene problemas de timezone donde '2026-03-15' se convierte
    // a '2026-03-14T21:00:00.000Z' por diferencia horaria
    dateStrings: true
  },
  define: {
    freezeTableName: true // Evitar la pluralización automática del nombre de la tabla
  }
});


export default sequelize;
