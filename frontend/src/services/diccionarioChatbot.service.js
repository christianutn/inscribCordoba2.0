const URL = process.env.REACT_APP_API_URL + "/diccionarioChatbot";
const URLP = process.env.REACT_APP_API_URL + "/diccionarioChatbot/Puntual";
console.log(URL);
export const getDiccionarioChatbot = async (pregunta, idCategoria) => {
    try {
        const response = await fetch(`${URL}?pregunta=${pregunta}&idCategoria=${idCategoria}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const data = await response.json();

        if (response.status !== 200) {
            throw new Error("No se encontraron las categorías de chatbot");
        }


        return data;
    } catch (error) {
        throw error;
    }
};

export const getDiccionarioChatbotPuntual = async (id) => {
    try {
        const response = await fetch(`${URLP}?id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const data = await response.json();

        if (response.status !== 200) {
            throw new Error("No se encontraró la pregunta seleccionada");
        }


        return data;
    } catch (error) {
        throw error;
    }
};


