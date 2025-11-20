
const URL = process.env.REACT_APP_API_URL + "/cambios-estados-notas-autorizacion";

export const getUltimosEstadoDeAutorizaciones = async () => {
    try {
        const response = await fetch(`${URL}/obtener-ultimo-estado-de-nota-de-autorizacion`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error;
    }
}