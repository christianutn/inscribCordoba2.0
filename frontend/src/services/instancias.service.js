
const URL = process.env.REACT_APP_API_URL + "/instancias";


export const postInstancias = async (newInstancia) => {
    try {

        const {selectMinisterio, selectArea, selectCurso, selectTipoCapacitacion, selectPlataformaDictado, selectMedioInscripcion, cupo, horas, tutoresSeleccionados, cohortes} = newInstancia

        
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
                cohortes: cohortes
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