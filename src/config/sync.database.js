import sequelize from "./database.js";

const syncModels = async () => {
    try {
      await sequelize.sync({ alter: true }); // Usa `alter: true` para hacer cambios seguros en la tabla
      console.log("Las tablas han sido sincronizadas.");
    } catch (error) {
      console.error("Error sincronizando las tablas:", error);
    }
  };
  
  export default syncModels;
  