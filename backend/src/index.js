import express from "express";
import indexRoutes from "./routes/index.routes.js"
import inicializarPassport from "../src/config/passport.js"

const app = express(); 

const PORT = 4000


//MIdleware
app.use(express.json());
inicializarPassport();



app.use("/api", indexRoutes);

//midlaware para manejar errores
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({message: err.message || "Error Interno"})
})



app.listen(PORT, () => console.log(`Server running on port ${PORT}`))



