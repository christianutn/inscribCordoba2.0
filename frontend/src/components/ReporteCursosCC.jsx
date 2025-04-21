import { useEffect, useState } from "react";
import { getCronograma } from "../services/googleSheets.service"; // Asegúrate que la ruta es correcta
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { Box, CircularProgress, Typography, Alert, Container, Paper } from "@mui/material";

// --- Helper Functions ---
const parseDateString = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return null;
    }
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            return null;
        }
        return date;
    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return null;
    }
};

function transformarEnObjetosClaveValor(matriz) {
    if (!Array.isArray(matriz) || matriz.length < 1) return [];
    const [cabecera, ...filas] = matriz;
    if (!Array.isArray(cabecera)) return [];

    return filas.map((fila) => {
        const obj = {};
        cabecera.forEach((columna, i) => {
            obj[columna] = (fila && i < fila.length) ? fila[i] ?? '' : '';
        });
        return obj;
    });
}

// --- Custom Toolbar Component ---
function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport
                csvOptions={{
                    fileName: 'reporte_mensual_cursos', // Nombre archivo CSV
                    delimiter: ';', // Delimitador
                    utf8WithBom: true, // Para correcta visualización de acentos en Excel
                }}
            />
        </GridToolbarContainer>
    );
}

// --- Main Report Component ---
const ReporteCursosCC = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Column Definitions (revisar widths si es necesario)
    const columns = [
        { field: 'mesNombre', headerName: 'Mes', flex: 1, sortable: false, filterable: false, align: 'center', headerAlign: 'center' },
        { field: 'cursosPorMes', headerName: 'Nuevos', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Cursos que comienzan en el mes' },
        { field: 'cursosActivosAnteriores', headerName: 'Anteriores', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Cursos activos de meses anteriores' },
        { field: 'plataformaExterna', headerName: 'Plataforma Externa', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Plataforma Externa' },
        { field: 'totalCursosAcumulados', headerName: 'Total Activos', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Total Activos en el Mes' },
        { field: 'canceladosSuspendidos', headerName: 'Canc/Susp.', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'autogestionados', headerName: 'Autogestionados', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        {
            field: 'porcentajeAutogestionados',
            headerName: '% Autog.',
            flex: 1,
            type: 'number',
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => params.value != null ? `${parseFloat(params.value).toFixed(1)}%` : '',
        },
    ];

    useEffect(() => {
        const fetchDataAndProcess = async () => {
            setLoading(true);
            setError(null);
            setRows([]); // Limpiar filas al iniciar carga
            try {
                const rawData = await getCronograma();
                if (!Array.isArray(rawData)) {
                    throw new Error("La respuesta del servicio Google Sheets no es válida (no es un array).");
                }
                const cronograma = transformarEnObjetosClaveValor(rawData);

                if (!cronograma || cronograma.length === 0) {
                    // Esto no es un error necesariamente, puede que no haya datos
                    console.log("No se encontraron datos en el cronograma o la transformación inicial falló.");
                    // No establecer error, simplemente no habrá filas
                } else {
                    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    const summaryData = [];

                    for (let mesIndex = 0; mesIndex < meses.length; mesIndex++) {
                        let cursosPorMes = 0;
                        let cursosActivosAnteriores = 0;
                        let plataformaExterna = 0;
                        let canceladosSuspendidos = 0;
                        let autogestionados = 0;

                        cronograma.forEach(curso => {
                            // Validaciones básicas del objeto curso
                            if (!curso || typeof curso !== 'object') return;

                            const fechaInicioCursoStr = curso["Fecha inicio del curso"];
                            const fechaFinCursoStr = curso["Fecha fin del curso"];
                            const estadoCurso = curso["Estado"]?.toUpperCase() || "";
                            const nombreCorto = curso["Código del curso"] || "";
                            const esAutogestionado = curso["Es Autogestionado"] === "Si";

                            const fechaInicioObj = parseDateString(fechaInicioCursoStr);
                            const fechaFinObj = parseDateString(fechaFinCursoStr);

                            if (!fechaInicioObj || !fechaFinObj) return; // Saltar si fechas inválidas

                            const mesInicioCurso = fechaInicioObj.getUTCMonth();
                            const mesFinCurso = fechaFinObj.getUTCMonth();
                            const isCancelledOrSuspended = estadoCurso === "SUSPENDIDO" || estadoCurso === "CANCELADO";

                            // Aplicar lógica de conteo
                            if (mesInicioCurso === mesIndex && !isCancelledOrSuspended) cursosPorMes++;
                            if (mesInicioCurso === mesIndex && isCancelledOrSuspended) canceladosSuspendidos++;
                            if (mesInicioCurso < mesIndex && mesFinCurso >= mesIndex && !isCancelledOrSuspended) cursosActivosAnteriores++;
                            if (mesInicioCurso === mesIndex && !isCancelledOrSuspended && nombreCorto.startsWith("EXT-")) plataformaExterna++;
                            if (mesInicioCurso === mesIndex && esAutogestionado && !isCancelledOrSuspended) autogestionados++;
                        });

                        const totalCursosAcumulados = cursosPorMes + cursosActivosAnteriores;
                        // Guardar como número para filtrado/ordenamiento si se activa
                        const porcentajeAutogestionadosNum = cursosPorMes > 0 ? (autogestionados / cursosPorMes) * 100 : 0;

                        summaryData.push({
                            id: mesIndex, // ID único para DataGrid
                            mesNombre: meses[mesIndex],
                            cursosPorMes,
                            cursosActivosAnteriores,
                            plataformaExterna,
                            totalCursosAcumulados,
                            canceladosSuspendidos,
                            autogestionados,
                            porcentajeAutogestionados: porcentajeAutogestionadosNum // Guardar como número
                        });
                    }
                    setRows(summaryData);
                } // Fin del else (si hay cronograma)

            } catch (error) {
                console.error("Error detallado:", error);
                setError(error.message || "Ocurrió un error desconocido al obtener o procesar los datos.");
                // setRows([]); // Ya se limpiaron al inicio
            } finally {
                setLoading(false);
            }
        };

        fetchDataAndProcess();
    }, []); // Ejecutar solo al montar

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> {/* Limita ancho y añade margen */}
            <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 3 }}>
                Reporte Mensual de Cursos
            </Typography>

            {/* Estado de Carga */}
            {loading && (
                <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 300, justifyContent: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Cargando datos del reporte...</Typography>
                </Paper>
            )}

            {/* Estado de Error */}
            {error && !loading && (
                <Alert severity="error" sx={{ my: 2 }}>
                    <strong>Error al cargar el reporte:</strong> {error}
                </Alert>
            )}

            {/* Contenido Principal (Tabla) */}
            {!loading && !error && (
                <Paper elevation={3} sx={{ height: 'auto', width: '100%', overflow: 'hidden' }}>
                    {/* Usar height: 'auto' y dejar que DataGrid maneje su altura o poner un minHeight */}
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading} // El DataGrid puede mostrar su propio spinner si es necesario
                        localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Textos en español
                        slots={{
                            toolbar: CustomToolbar, // Usar la barra de herramientas personalizada
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 12 }, // Mostrar todos los meses
                            },
                            density: 'compact', // Empezar con densidad compacta
                        }}
                        pageSizeOptions={[12, 24]} // Opciones de tamaño
                        autoHeight // Ajusta la altura al contenido
                        // getRowId={(row) => row.id} // No necesario si el campo ID se llama 'id'
                        sx={{
                            // Estilo moderno para cabeceras
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f5f5f5', // Un gris claro
                                borderBottom: '1px solid #e0e0e0',
                                color: '#333', // Texto más oscuro
                                fontWeight: '600', // Un poco más de peso
                            },
                            // Estilo Cebra (filas alternas)
                            '& .MuiDataGrid-row:nth-of-type(odd)': {
                                backgroundColor: '#fafafa', // Color ligeramente diferente para filas impares
                            },
                            // Borde general sutil
                            border: '1px solid #e0e0e0',
                            // Quitar borde de celdas si se prefiere un look más limpio
                            '& .MuiDataGrid-cell': {
                                border: 'none',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                borderRight: '1px solid #e0e0e0' // Línea vertical separadora en headers
                            }
                        }}
                    // Si no hay filas, muestra un mensaje personalizado
                    // (Requiere importar NoRowsOverlay o crear uno)
                    // slots={{
                    //   noRowsOverlay: () => <div style={{padding: 20, textAlign: 'center'}}>No hay datos para mostrar</div>
                    // }}
                    />
                </Paper>
            )}
        </Container>
    );
}

export default ReporteCursosCC; 
// antes de los cambios