import express from "express";
import indexRoutes from "./routes/index.routes.js"
import inicializarPassport from "../src/config/passport.js"
import cors from "cors";
import sequelize from "./config/database.js";
import associateModels from "./models/asociateModelos.js";
import 'dotenv/config'; 



const app = express();

// Inicialización de Sequelize
const initSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        // Sincronización de modelos
        //await sequelize.sync({ alter: true }); // Opciones como 'alter: true' pueden ser útiles para aplicaciones en desarrollo
        associateModels();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Llamada a la función para inicializar Sequelize
initSequelize();

app.use(cors());

const PORT = 4000

//MIdleware
app.use(express.json());
inicializarPassport();



app.use("/api", indexRoutes);

//midlaware para manejar errores
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message || "Error Interno" })
})


app.listen(PORT, () => console.log(`Server running on port ${PORT}`))



