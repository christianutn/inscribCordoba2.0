import { getDataRange } from "../utils/getDataRange.js";
import authorize from "../utils/getAuth.js";
import { google } from 'googleapis';
import ControlDataFechaInicioCursada from "../../models/controlDataFechaInicioCursada.models.js";

export const getMatrizFechas = async (aplicaRestricciones) => {
    try {
        const auth = authorize;
        const googleSheets = google.sheets({ version: 'v4', auth });

        const controlData = await ControlDataFechaInicioCursada.findOne({ where: { id: 1 } });
        if (!controlData) throw new Error('No se encontró la configuración de control de datos');

        const data = await getDataRange(googleSheets, auth, "principal", "B:X");

        const matrizFechas = Array.from({ length: 12 }, () =>
            Array.from({ length: 31 }, () => ({ cantCupo: 0, cantCursos: 0, esPosible: true }))
        );

        if (data && data.length > 0) {
            const [headers, ...rows] = data;

            const keyValueArray = rows.map(row =>
                headers.reduce((acc, header, index) => ({
                    ...acc,
                    [header]: row[index]
                }), {})
            );

            keyValueArray.forEach(row => {
                const fechaInicioCursada = new Date(row['Fecha inicio del curso']);
                const cupo = parseInt(row["Cupo"], 10) || 0;
                const estado = row["Estado"];

                if (estado !== "SUSPENDIDO" && estado !== "CANCELADO") {
                    const mesUTC = fechaInicioCursada.getUTCMonth();
                    const diaUTC = fechaInicioCursada.getUTCDate() - 1;

                    matrizFechas[mesUTC][diaUTC].cantCupo += cupo;
                    matrizFechas[mesUTC][diaUTC].cantCursos += 1;
                }
            });
        }

        const hoy = new Date();
        const mesActual = hoy.getUTCMonth();
        const diaActual = hoy.getUTCDate() - 1;

        // Marca días y meses anteriores como no posibles
        marcarNoPosibles(matrizFechas, mesActual, diaActual);

        // Verifica límites y bloqueos

        if (aplicaRestricciones) {
            verificarLimites(matrizFechas, mesActual, controlData);
        }






        return matrizFechas;

    } catch (error) {
        
        throw error;
    }
}

function marcarNoPosibles(matrizFechas, mesActual, diaActual) {
    for (let j = 0; j < diaActual; j++) {
        matrizFechas[mesActual][j].esPosible = false;
    }

    for (let i = 0; i < mesActual; i++) {
        for (let j = 0; j < 31; j++) {
            matrizFechas[i][j].esPosible = false;
        }
    }
}

function verificarLimites(matrizFechas, mesActual, controlData) {
    for (let i = mesActual; i < 12; i++) {
        let totalCursosMensual = 0;
        let totalCuposMensual = 0;

        for (let j = 0; j < 31; j++) {
            totalCursosMensual += matrizFechas[i][j].cantCursos;
            totalCuposMensual += matrizFechas[i][j].cantCupo;

            if (totalCursosMensual >= controlData.maximoCursosXMes ||
                totalCuposMensual >= controlData.maximoCuposXMes ||
                controlData.mesBloqueado == i + 1) {
                matrizFechas[i].forEach(dia => dia.esPosible = false);
                break;
            }

            if (matrizFechas[i][j].cantCupo >= controlData.maximoCuposXDia ||
                matrizFechas[i][j].cantCursos >= controlData.maximoCursosXDia) {
                matrizFechas[i][j].esPosible = false;
            }
        }
    }
}
