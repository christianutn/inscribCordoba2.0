
const URL = process.env.REACT_APP_API_URL + "/instancias";


export const postInstancias = async (newInstancia) => {
    try {

        const {selectMinisterio, selectArea, selectCurso, selectTipoCapacitacion, selectPlataformaDictado, selectMedioInscripcion, cupo, horas, tutoresSeleccionados, cohortes, opciones, comentario} = newInstancia

        
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ministerio: selectMinisterio,
                area: selectArea,
                curso: selectCurso,
                tipo_capacitacion: selectTipoCapacitacion,
                plataforma_dictado: selectPlataformaDictado,
                medio_inscripcion: selectMedioInscripcion,
                cupo: cupo,
                horas: horas,
                tutores: tutoresSeleccionados,
                cohortes: cohortes,
                opciones: opciones,
                comentario: comentario
            })
        })
        const data = await response.json();
        if(response.status !== 201) {
            throw new Error(data.message || "Error al registrar instancia")
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const get_supera_cantidad_cursos_acumulado_mes = async (anio, mes) => {
    try {
        const response = await fetch(`${URL}/supera-cantidad-cursos-acumulado-por-mes?anio=${anio}&mes=${mes}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al obtener los datos de acumulación mensual");
        }
        return data; // Expected to be an array of date strings e.g., ["2023-12-15"]
    } catch (error) {
        // console.error("Error in get_supera_cantidad_cursos_acumulado_mes:", error); // Optional: for debugging
        throw error;
    }
};

export const supera_cupo_mes = async (fecha) => {
    try {
        const response = await fetch(`${URL}/supera-cantidad-cupo-mes/${fecha}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        })
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al registrar instancia")
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const supera_cupo_dia = async (fecha) => {
    try {
        const response = await fetch(`${URL}/supera-cantidad-cupo-dia/${fecha}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        })
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al registrar instancia")
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const supera_cantidad_cursos_acumulado = async (fecha) => {
    try {
        const response = await fetch(`${URL}/supera-cantidad-cursos-acumulado/${fecha}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        })
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al registrar instancia")
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const supera_cantidad_cursos_mes = async (dateObj) => {
    try {
        const response = await fetch(`${URL}/supera-cantidad-cursos-mes/${dateObj}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        })
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al registrar instancia")
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const supera_cantidad_cursos_dia = async (fecha) => {
    try {
        const response = await fetch(`${URL}/supera-cantidad-cursos-dia/${fecha}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        })
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al registrar instancia")
        }
        
        return data
    } catch (error) {
        throw error
    }
}


