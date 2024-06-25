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

//Prueba de conexión
const connectDB = async () => {
  try {
    await sequelize.authenticate();
   

    
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
connectDB(); 
 
 const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // Usa `alter: true` para hacer cambios seguros en la tabla
    console.log("Las tablas han sido sincronizadas.");
  } catch (error) {
    console.error("Error sincronizando las tablas:", error);
  }
};

//syncModels();   


export default sequelize;
