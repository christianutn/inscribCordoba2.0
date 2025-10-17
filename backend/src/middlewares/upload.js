import multer from 'multer';
import AppError from '../utils/appError.js';

// Configurar multer para almacenar el archivo en memoria
const storage = multer.memoryStorage();

// Filtro para aceptar solo archivos .xlsx
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
    } else {
        cb(new AppError('Solo se permiten archivos .xlsx', 400), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Límite de 5MB
    }
});

export default upload;
