import CategoriaChatbot from "../models/categoriaChatbot.models.js";

export const getCategorias = async (req, res) => {
    try {
        const categorias = await CategoriaChatbot.findAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

export const insertCategoria = async (req, res, next) => {
    try {
        const { nombre } = req.body;
        console.log(nombre);
        const existe = await CategoriaChatbot.findOne({ where: { nombre: nombre } });
        console.log(existe);
        if (existe) throw new Error("El nombre de la categoría ya existe");
        const response = await CategoriaChatbot.create({ nombre: nombre });
        res.status(201).json(response)
    } catch (error) {
        next(error)
    }
};
