import { Sequelize } from "sequelize";
import 'dotenv/config';

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT
} = process.env;

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
