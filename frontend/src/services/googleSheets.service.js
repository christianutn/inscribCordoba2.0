


const URL = process.env.REACT_APP_API_URL + "/googleSheets";

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

export const buscarPosicionFecha = (fecha, ListaFechas) => {
    let inicio = 0;
    let fin = ListaFechas.length;
    const fechaBuscada = new Date(Date.UTC(
        Number(fecha.split('-')[0]),
        Number(fecha.split('-')[1]) - 1,
        Number(fecha.split('-')[2])
        ));
    let resultado = -1; // Inicializamos con -1 por si no hay coincidencias

    while (inicio < fin) {
        const medio = Math.floor((inicio + fin) / 2);
        const fechaLista = ListaFechas[medio].fecha;
            const fechaListaDate = new Date(Date.UTC(
            Number(fechaLista.split('-')[0]),
            Number(fechaLista.split('-')[1]) - 1,
            Number(fechaLista.split('-')[2])
            ));


        if (fechaListaDate.getTime() === fechaBuscada.getTime()) {
            return medio; // Coincidencia exacta encontrada
        } else if (fechaListaDate < fechaBuscada) {
            resultado = medio; // Almacenamos el índice del último menor
            inicio = medio + 1; // Buscamos en la mitad superior
        } else {
            fin = medio; // Buscamos en la mitad inferior
        }
    }

    return resultado === -1 ? 0: resultado // Si no hay coincidencias, retornamos 0. Si no, retornamos la última que fue menor (o la primera)
};            


export const getObjNroEventos = async () => {
    try {
        const response = await fetch(URL + "/nroEventos", {
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