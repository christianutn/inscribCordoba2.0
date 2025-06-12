import { Sequelize } from "sequelize";
import 'dotenv/config';

const {
  DB_NAME_DESARROLLO,
  DB_USER_DESARROLLO,
  DB_PASSWORD_DESARROLLO,
  DB_HOST_DESARROLLO,
  DB_PORT_DESARROLLO
} = process.env;

const sequelize = new Sequelize(DB_NAME_DESARROLLO, DB_USER_DESARROLLO, DB_PASSWORD_DESARROLLO, {
  host: DB_HOST_DESARROLLO,
  dialect: 'mysql',
  port: DB_PORT_DESARROLLO,
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
