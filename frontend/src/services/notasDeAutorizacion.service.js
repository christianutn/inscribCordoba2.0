
const URL = process.env.REACT_APP_API_URL + "/notas-autorizacion";


export const subirNotaDeAutorizacion = async (archivo) => {
  const formData = new FormData();
  formData.append("nota_autorizacion", archivo);
  try {
    const response = await fetch(`${URL}/subir-nota-de-autorizacion`, {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`
      }
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.message);
    }
    

    return data;
  } catch (error) {
    throw error;
  }
}