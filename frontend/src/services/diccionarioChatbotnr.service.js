const URL = process.env.REACT_APP_API_URL + "/diccionarioChatbotnr";

export const getDiccionarioChatbotnr = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            console.log(response);
            throw new Error("No se encontraron registros");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

// export const getDiccionarioChatbotPuntual = async (id) => {
//     try {
//         const response = await fetch(`${URLP}?id=${id}`, {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//             }
//         });
//         const data = await response.json();

//         if (response.status !== 200) {
//             throw new Error("No se encontraró la pregunta seleccionada");
//         }


//         return data;
//     } catch (error) {
//         throw error;
//     }
// };


