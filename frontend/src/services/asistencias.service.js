const URL = process.env.REACT_APP_API_URL + "/asistencias/inscripciones/cargas-masivas";

export const postSubaMasiva = async (archivo) => {

    const formData = new FormData();
    formData.append("excelFile", archivo);
    try {
        const response = await fetch(`${URL}`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
      
        alert(data.message);
    } catch (error) {
        console.error("Error al enviar el archivo:", error);
        alert("Error al enviar el archivo");
    }
}
