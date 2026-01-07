import NotaModel from "../models/nota.model.js";

export const getNotaPorCuilYEvento = async (req, res) => {
    try {
        const { cuil, id_evento } = req.params;
        const nota = await NotaModel.findOne({ where: { cuil, id_evento } });
        if (nota) {
            return res.status(200).json(nota);
        } else {
            return res.status(404).json({ message: 'Nota no encontrada' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const crearOActualizarNota = async (req, res) => {
    try {
        const { cuil, id_evento } = req.params;
        const { nota } = req.body;

        const [notaInstance, created] = await NotaModel.findOrCreate({
            where: { cuil, id_evento },
            defaults: { nota }
        });

        if (!created) {
            notaInstance.nota = nota;
            await notaInstance.save();
            return res.status(200).json(notaInstance);
        }

        return res.status(201).json(notaInstance);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


