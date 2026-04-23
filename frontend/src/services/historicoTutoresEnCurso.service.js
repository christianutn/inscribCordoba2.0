import apiClient from './apiClient';
const URL = process.env.REACT_APP_API_URL + "/historico-tutores-en-cursos";

export const getHistoricoTutoresVigentesPorCurso = async (curso_cod) => {
    try {
        const tutores = await apiClient(`${URL}/${curso_cod}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await tutores.json();
        if (tutores.status !== 200) {
            throw new Error(data.message || "Error al buscar tutores")
        }
        return data
    } catch (error) {
        throw error
    }
}

export const asignarNuevoRol = async (data) => {
    try {
        const response = await apiClient(`${URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        const result = await response.json();
        if (response.status !== 201) {
            throw new Error(result.message || "Error al asignar rol")
        }
        return result
    } catch (error) {
        throw error
    }
}
