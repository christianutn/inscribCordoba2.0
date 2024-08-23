

const URL = "http://localhost:4000/api/googleSheets"

export const getCronograma = async () => {

    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });

        const data = await response.json();
        if(response.status !== 200) {
            throw new Error("No se encontraron los datos");
        }
        
        return data
        
    } catch (error) {
        throw error
    }

}

export const getMatrizFechas = async () => {
    try {
        const response = await fetch(URL + "/matrizFechas", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        }); 

        const data = await response.json();
        if(response.status !== 200) {
            throw new Error("No se encontraron los datos");
        }
        
        return data
        
    } catch (error) {
        throw error
    }
}