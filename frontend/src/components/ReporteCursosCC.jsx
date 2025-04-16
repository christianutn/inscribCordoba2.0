import { useEffect, useState } from "react";
import { getCronograma } from "../services/googleSheets.service";
import { DataGrid } from "@mui/x-data-grid";


const ReporteCursosCC = () => {

    const [cronograma, setCronograma] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]);
    const [colums, setColums] = useState([]);

    const columns = [
        { field: 'mes', headerName: 'mes', width: 70 },
        { field: 'CantidadPorMes', headerName: 'Cantidad por mes', width: 200 },
        { field: 'CursosActivosDeMesesAnteriores', headerName: 'Cursos activos de meses anteriores', type: 'number', width: 90 },
        { field: 'PlataformaExterna', headerName: 'Plataforma Externa', type: 'date', width: 150 },
        { field: 'TotalCursosAcumulados', headerName: 'Total cursos acumulados', type: 'date', width: 150 },
        { field: 'CanceladosSuspendidos', headerName: 'Cancelados/Suspendidos', type: 'date', width: 150 },
        { field: 'Autogestionados', headerName: 'Autogestionados', type: 'date', width: 150 },
        { field: 'porcentajeAutogestionados', headerName: '% Autogestionados', type: 'date', width: 150 },
        
      ];




useEffect(() => {
    const fetchData = async () => {
        try {
            const data = await getCronograma();

            const cronograma = transformarEnObjetosClaveValor(data); // Transformar la matriz en objetos clave-valor

            
            

            setRows(rows);
            setColums(colums);

            setCronograma(cronograma);
            setLoading(false);
            setError(null);
        } catch (error) {
            setError(error.message);
            setLoading(false);
            console.error("Error al obtener los datos:", error);
        }
    };

    fetchData();

}, []);


function transformarEnObjetosClaveValor(matriz) {
    const [cabecera, ...filas] = matriz;

    return filas.map(fila => {
        const obj = {};
        cabecera.forEach((columna, i) => {
            obj[columna] = fila[i] ?? ''; // Si falta algún campo, lo completa con string vacío
        });
        return obj;
    });
}

return (
    <div>
        <h1>Reporte Cursos CC</h1>
        <p>Contenido del reporte de cursos CC.</p>
        {loading && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}
        {!loading && !error && (
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={colums}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>
        )}
        <p>Este es un ejemplo de cómo se puede mostrar el contenido del reporte de cursos CC.</p>
    </div>
);
}

export default ReporteCursosCC;