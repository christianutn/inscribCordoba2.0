export const getFeriados = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const urls = [
      `https://api.argentinadatos.com/v1/feriados/${currentYear}`,
      `https://api.argentinadatos.com/v1/feriados/${nextYear}`
    ];

    // Ejecutamos ambas peticiones en paralelo
    const responses = await Promise.all(
      urls.map(url => fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }))
    );

    // Verificamos si alguna petición falló
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Error en la API de feriados: ${response.status}`);
      }
    }

    // Convertimos ambas respuestas a JSON
    const [dataCurrent, dataNext] = await Promise.all(
      responses.map(res => res.json())
    );

    // Combinamos ambos arrays en uno solo
    const allFeriados = [...dataCurrent, ...dataNext];

    res.status(200).json(allFeriados);
  } catch (error) {
    console.error("Error al obtener feriados:", error.message);
    res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
};