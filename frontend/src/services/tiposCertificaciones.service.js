import apiClient from './apiClient';
const URL = process.env.REACT_APP_API_URL + "/tiposCertificaciones";

export const getTiposCertificaciones = async () => {
    try {
        const response = await apiClient(URL, {
            method: "GET",
            headers: {                
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();        
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(error.message || "Error al obtener los tipos de certificaciones");
        }
        return data
    } catch (error) {
        throw error
    }
}
