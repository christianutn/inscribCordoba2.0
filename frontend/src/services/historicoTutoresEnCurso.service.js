
const URL = process.env.REACT_APP_API_URL + "/historico-tutores-en-cursos";

export const getHistoricoTutoresVigentesPorCurso = async (curso_cod) => {
    try {
        const tutores = await fetch(`${URL}/${curso_cod}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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