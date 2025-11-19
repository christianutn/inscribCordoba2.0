import multer from "multer";
import AppError from "../utils/appError.js"
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

class ManejadorArchivos {
  constructor(nombre) {
    // Almacenamiento en memoria, no se escribe en disco
    const storage = multer.memoryStorage();
    this.upload = multer({ storage });
    this.nombre = nombre;
    // Ruta base para uploads (funciona tanto en desarrollo como en Docker)
    this.uploadPath = path.join(process.cwd(), 'uploads', 'notas_de_autorizacion');
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

  async guardarNotaDeAutorizacionLocalmente(id, archivo) {
    const fileName = `${id}.pdf`;
    const filePath = path.join(this.uploadPath, fileName);

    // Guardar archivo en el sistema de archivos
    await fs.promises.writeFile(filePath, archivo.buffer);

    return {
      nombreDelArchivo: fileName,
      ruta: filePath,
      rutaRelativa: `uploads/notas_de_autorizacion/${fileName}`
    };
  }
}

export default ManejadorArchivos;