import apiClient from './apiClient';
const URL = process.env.REACT_APP_API_URL + "/rolesTutor";


export const getRolesDeTutor = async () => {

    try {
        const response = await apiClient(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al obtener los roles de tutor");
        }

        return data
    } catch (error) {
        throw error
    }
}
