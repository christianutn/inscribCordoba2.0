import CategoriaChatbot from "../models/categoriaChatbot.models.js";

export const getCategorias = async (req, res) => {
    try {
        const categorias = await CategoriaChatbot.findAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};