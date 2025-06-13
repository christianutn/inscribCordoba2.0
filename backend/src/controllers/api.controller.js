export const getFeriados =  async (req, res) => {
    try {
      const { year } = req.query;
      const targetYear = year || new Date().getFullYear();
      const url = `https://api.argentinadatos.com/v1/feriados/${targetYear}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Feriados obtenidos:", data);

      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener feriados:", error.message);
      res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
  }