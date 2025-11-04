import multer from "multer";
import AppError from "../utils/appError.js"

class ManejadorArchivos {
  constructor(nombre) {
    // Almacenamiento en memoria, no se escribe en disco
    const storage = multer.memoryStorage();
    this.upload = multer({ storage });
    this.nombre = nombre
  }

  middleware() {
    // Middleware para recibir un solo archivo
    return this.upload.single(this.nombre);
  }

  obtenerArchivoBinario(req) {
    if (!req.file) {
      throw new AppError("No se encontró ningún archivo en la solicitud", 400);
    }

    return {
      nombre: req.file.originalname,
      data: req.file.buffer, // el PDF ya está en binario
    };
  }
}

export default ManejadorArchivos;