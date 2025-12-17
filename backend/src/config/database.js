import { Sequelize } from "sequelize";
import 'dotenv/config';


let DB_NAME;
let DB_USER;
let DB_PASSWORD;
let DB_HOST;
let DB_PORT;

if (process.env.NODE_ENV == "production") {
  DB_NAME = process.env.DB_NAME_PROD;
  DB_USER = process.env.DB_USER_PROD;
  DB_PASSWORD = process.env.DB_PASSWORD_PROD;
  DB_HOST = process.env.DB_HOST_PROD;
  DB_PORT = process.env.DB_PORT_PROD;
} else if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test") {
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
  dialectOptions: {
    ssl: {
      require: true, // Requiere SSL para la conexión
      rejectUnauthorized: false // Permitir conexiones SSL no autorizadas
    }
  },
  define: {
    freezeTableName: true // Evitar la pluralización automática del nombre de la tabla
  }
});


export default sequelize;
