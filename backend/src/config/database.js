import { Sequelize } from "sequelize";
import 'dotenv/config';


let DB_NAME;
let DB_USER;
let DB_PASSWORD;
let DB_HOST;
let DB_PORT;

if (process.env.ES_RED_GOBIERNO == "si") {
  DB_NAME = process.env.DB_NAME_GOBIERNO;
  DB_USER = process.env.DB_USER_GOBIERNO;
  DB_PASSWORD = process.env.DB_PASSWORD_GOBIERNO;
  DB_HOST = process.env.DB_HOST_GOBIERNO;
  DB_PORT = process.env.DB_PORT_GOBIERNO;
} else if (process.env.ES_RED_GOBIERNO != "si" && (process.env.NODE_ENV == "desarrollo" || process.env.NODE_ENV == "test")) {
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
