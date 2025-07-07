import Aviso from "../models/avisos.models.js";

export const getAvisos = async (req, res) => {
    try {
        const avisos = await Aviso.findAll();
        res.json(avisos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};


export const postAviso = async (req, res) => {
    try {
        const { titulo, contenido, icono, visible } = req.body;
        const avisoNuevo = await Aviso.create({ titulo, contenido, icono, visible });
        res.status(201).json(avisoNuevo);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el aviso' });
    }
};
// Asegúrate de que tu modelo Aviso esté importado
// import Aviso from '../models/aviso.models.js'; // Ajusta la ruta si es necesario

export const deleteAviso = async (req, res) => {
    try {
        // Extraemos el ID de los parámetros de la solicitud
        const { id } = req.params;

        // --- 1. Validación de entrada: Verificar si se proporcionó un ID ---
        if (!id) {
          
            return res.status(400).json({ message: 'ID del aviso no proporcionado.' });
        }

        

        // --- 2. Intentar eliminar el aviso y verificar el resultado ---
        // destroy retorna el número de filas afectadas
        const rowsAffected = await Aviso.destroy({
            where: { id: id } // Usamos el ID directamente de req.params
        });

        // --- 3. Manejar el caso donde el aviso no fue encontrado ---
        if (rowsAffected === 0) {
           
            // Si 0 filas fueron afectadas, significa que el aviso no existía con ese ID.
            // Respondemos con 404 Not Found.
            return res.status(404).json({ message: 'Aviso no encontrado.' });
        }

        // --- 4. Manejar el caso de éxito ---
        
        res.status(204).send();

    } catch (error) {
        // --- 5. Manejar errores internos o de base de datos ---
    
        // Enviamos una respuesta 500 Internal Server Error al cliente con un mensaje genérico
        res.status(500).json({ message: 'Error interno del servidor al eliminar el aviso.' });
    }
};