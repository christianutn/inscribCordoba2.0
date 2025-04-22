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
        console.log("Contenido:", req.body);
        const avisoNuevo = await Aviso.create({ titulo, contenido, icono, visible });
        console.log("Aviso creado:", avisoNuevo);
        res.status(201).json(avisoNuevo);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el aviso' });
    }
};
export const deleteAviso = async (req, res) => {
    try {
        const { id } = req.params;
        await Aviso.destroy({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el aviso' });
    }
};