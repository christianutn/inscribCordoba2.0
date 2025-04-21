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
import { Box, CircularProgress, Typography, Alert, Container, Paper, Grid } from "@mui/material"; // Import Grid

// --- Helper Functions ---
const parseDateString = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // console.warn("Formato de fecha inválido o ausente:", dateString);
        return null;
    }
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        // Usar UTC para evitar problemas de zona horaria al extraer mes/año
        const date = new Date(Date.UTC(year, month - 1, day));
        // Validar que el objeto Date sea válido y corresponda a la entrada
        if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            console.warn("Fecha inválida tras parseo:", dateString);
            return null;
        }
        return date;
    } catch (e) {
        console.error("Error parseando fecha:", dateString, e);
        return null;
    }
};

function transformarEnObjetosClaveValor(matriz) {
    if (!Array.isArray(matriz) || matriz.length < 1) return [];
    const [cabecera, ...filas] = matriz;
    if (!Array.isArray(cabecera)) return [];

    return filas.map((fila, index) => {
        const obj = { id: `row-${index}` }; // ID base por si faltara columna única
        cabecera.forEach((columna, i) => {
            const key = columna.trim(); // Usar nombre original como clave, quitando espacios extra
            obj[key] = (fila && i < fila.length) ? fila[i] ?? '' : '';
        });
        // Opcional: Si tienes una columna ID fiable (ej. 'Código del curso'), usarla
        // if (obj['Código del curso']) {
        //     obj.id = obj['Código del curso'];
        // }
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

// --- Componente de Resumen Anual ---
const ResumenAnual = ({ data }) => {
    const { totalNuevos, totalAutogestionados } = data.reduce(
        (acc, row) => {
            acc.totalNuevos += row.cursosPorMes || 0;
            acc.totalAutogestionados += row.autogestionados || 0;
            return acc;
        },
        { totalNuevos: 0, totalAutogestionados: 0 }
    );

    const totalTradicionales = totalNuevos - totalAutogestionados;
    const porcentajeTradicionales = totalNuevos > 0 ? (totalTradicionales / totalNuevos) * 100 : 0;
    const porcentajeAutogestionados = totalNuevos > 0 ? (totalAutogestionados / totalNuevos) * 100 : 0;

    if (totalNuevos === 0) {
        return (
             <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>Resumen Anual</Typography>
                <Typography variant="body1">No se registraron cursos nuevos este año para calcular el resumen.</Typography>
             </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom component="h2" sx={{ mb: 3, textAlign: 'center', fontWeight: 'medium' }}>
                Resumen Anual
            </Typography>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                {/* Columna Cursos Tradicionales */}
                <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex' }}>
                    <Box sx={{
                        p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center',
                        width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                    }}>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ color: 'text.secondary' }}>
                            Cursos Tradicionales
                        </Typography>
                        <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                            {totalTradicionales}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            ({porcentajeTradicionales.toFixed(1)}%)
                        </Typography>
                    </Box>
                </Grid>

                {/* Columna Cursos Autogestionados */}
                 <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex' }}>
                     <Box sx={{
                        p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center',
                        width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                     }}>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ color: 'text.secondary' }}>
                            Cursos Autogestionados
                        </Typography>
                        <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 1 }}>
                            {totalAutogestionados}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            ({porcentajeAutogestionados.toFixed(1)}%)
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
             <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', color: 'text.disabled' }}>
                * Porcentajes calculados sobre el total de {totalNuevos} cursos nuevos iniciados en el año.
            </Typography>
        </Paper>
    );
};


// --- Main Report Component ---
const ReporteCursosCC = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Column Definitions --- (CORREGIDO)
    const columns = [
        { field: 'mesNombre', headerName: 'Mes', flex: 1, sortable: false, filterable: false, align: 'center', headerAlign: 'center' },
        { field: 'cursosPorMes', headerName: 'Nuevos', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Cursos que comienzan en el mes' },
        { field: 'cursosActivosAnteriores', headerName: 'Anteriores', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Cursos activos de meses anteriores' },
        { field: 'plataformaExterna', headerName: 'Plataforma Externa', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Plataforma Externa (Nuevos)' },
        { field: 'totalCursosAcumulados', headerName: 'Total Activos', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Total Activos en el Mes (Nuevos + Anteriores)' },
        { field: 'canceladosSuspendidos', headerName: 'Canc/Susp.', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Cursos cancelados/suspendidos que iniciaban en el mes' },
        { field: 'autogestionados', headerName: 'Autogestionados', type: 'number', flex: 1, align: 'center', headerAlign: 'center', description: 'Cursos autogestionados que iniciaban en el mes' },
        {
            field: 'porcentajeAutogestionados',
            headerName: '% Autog.',
            flex: 1,
            type: 'number',
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (params) => params.value, // Asegura valor numérico para posible orden/filtro futuro
            renderCell: (params) => params.value != null ? `${parseFloat(params.value).toFixed(1)}%` : '',
            description: '% de Autogestionados sobre Nuevos del mes'
        },
    ];

    useEffect(() => {
        const fetchDataAndProcess = async () => {
            setLoading(true);
            setError(null);
            setRows([]);
            try {
                const rawData = await getCronograma();
                if (!Array.isArray(rawData)) {
                    throw new Error("La respuesta del servicio Google Sheets no es válida (no es un array).");
                }
                const cronograma = transformarEnObjetosClaveValor(rawData);

                if (!cronograma || cronograma.length === 0) {
                    console.log("No se encontraron datos en el cronograma.");
                } else {
                    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    const summaryData = [];
                    const currentYear = new Date().getUTCFullYear();

                    for (let mesIndex = 0; mesIndex < meses.length; mesIndex++) {
                        let cursosPorMes = 0;
                        let cursosActivosAnteriores = 0;
                        let plataformaExterna = 0;
                        let canceladosSuspendidos = 0;
                        let autogestionados = 0;

                        cronograma.forEach(curso => {
                            if (!curso || typeof curso !== 'object') return;

                            const fechaInicioCursoStr = curso["Fecha inicio del curso"];
                            const fechaFinCursoStr = curso["Fecha fin del curso"];
                            const estadoCurso = curso["Estado"]?.toUpperCase().trim() || "";
                            const nombreCorto = curso["Código del curso"] || "";
                            const esAutogestionado = curso["Es Autogestionado"]?.trim().toLowerCase() === "si";

                            const fechaInicioObj = parseDateString(fechaInicioCursoStr);
                            const fechaFinObj = parseDateString(fechaFinCursoStr);

                            if (!fechaInicioObj) return; // Saltar si fecha inicio inválida

                            const yearInicioCurso = fechaInicioObj.getUTCFullYear();

                            // --- Filtrar por año actual ---
                             if (yearInicioCurso !== currentYear) {
                                 // Lógica para 'Anteriores' que empezaron años antes podría ir aquí si fuera necesario
                                 // Por ahora, sólo contamos los NUEVOS del año actual
                                 // Si un curso empezó el año pasado y termina este año, SÍ debería contar en 'Anteriores'
                                 // Revisemos la lógica de 'Anteriores'
                             }
                             // ---------------------------

                            const mesInicioCurso = fechaInicioObj.getUTCMonth();
                            const mesFinCurso = fechaFinObj ? fechaFinObj.getUTCMonth() : -1;
                            const yearFinCurso = fechaFinObj ? fechaFinObj.getUTCFullYear() : -1;
                            const isCancelledOrSuspended = estadoCurso === "SUSPENDIDO" || estadoCurso === "CANCELADO";

                            // --- Lógica de Conteo ---

                            // 1. Cursos NUEVOS en el mes (Inician en mesIndex del año actual, no cancelados/suspendidos)
                            if (yearInicioCurso === currentYear && mesInicioCurso === mesIndex && !isCancelledOrSuspended) {
                                cursosPorMes++;
                                if (esAutogestionado) autogestionados++;
                                if (nombreCorto.startsWith("EXT-")) plataformaExterna++;
                            }

                            // 2. Cursos CANCELADOS/SUSPENDIDOS (Inician en mesIndex del año actual y están cancelados/suspendidos)
                            if (yearInicioCurso === currentYear && mesInicioCurso === mesIndex && isCancelledOrSuspended) {
                                canceladosSuspendidos++;
                            }

                            // 3. Cursos ACTIVOS ANTERIORES (Iniciaron antes del mesIndex del año actual O en un año anterior,
                            //    terminan en o después de mesIndex del año actual, y no están cancelados/suspendidos)
                            if (fechaFinObj && !isCancelledOrSuspended) {
                                const iniciaAntesDelMesActual = (yearInicioCurso < currentYear) || (yearInicioCurso === currentYear && mesInicioCurso < mesIndex);
                                const terminaEnOMasAllaDelMesActual = (yearFinCurso > currentYear) || (yearFinCurso === currentYear && mesFinCurso >= mesIndex);

                                if (iniciaAntesDelMesActual && terminaEnOMasAllaDelMesActual) {
                                     // Verificar que el curso no haya sido contado como 'Nuevo' este mismo mes si empezó justo antes
                                     // (Aunque la condición mesInicioCurso < mesIndex ya debería prevenir esto)
                                    cursosActivosAnteriores++;
                                }
                            }
                        }); // Fin forEach curso

                        const totalCursosActivosEnMes = cursosPorMes + cursosActivosAnteriores;
                        const porcentajeAutogestionadosNum = cursosPorMes > 0 ? (autogestionados / cursosPorMes) * 100 : 0;

                        summaryData.push({
                            id: `${currentYear}-${mesIndex}`, // ID único para la fila
                            mesNombre: meses[mesIndex],
                            cursosPorMes,
                            cursosActivosAnteriores,
                            plataformaExterna,
                            totalCursosAcumulados: totalCursosActivosEnMes,
                            canceladosSuspendidos,
                            autogestionados,
                            porcentajeAutogestionados: porcentajeAutogestionadosNum,
                        });
                    } // Fin for mesIndex
                    setRows(summaryData);
                } // Fin else (si hay cronograma)

            } catch (error) {
                console.error("Error detallado:", error);
                setError(error.message || "Ocurrió un error desconocido al obtener o procesar los datos.");
            } finally {
                setLoading(false);
            }
        };

        fetchDataAndProcess();
    }, []); // Ejecutar solo al montar

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 3 }}>
                Reporte Mensual de Cursos {new Date().getUTCFullYear()} {/* Añadir año al título */}
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

            {/* Contenido Principal (Tabla y Resumen) */}
            {!loading && !error && (
                <> {/* Fragmento para agrupar */}
                    <Paper elevation={3} sx={{ height: 'auto', width: '100%', overflow: 'hidden', mb: 4 }}> {/* Añadir margen inferior */}
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                            slots={{
                                toolbar: CustomToolbar,
                                noRowsOverlay: () => <div style={{padding: 20, textAlign: 'center'}}>No hay datos para mostrar este año</div>
                            }}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 12 },
                                },
                                density: 'compact',
                            }}
                            pageSizeOptions={[12]} // Solo opción de 12 para mostrar el año
                            autoHeight
                            getRowId={(row) => row.id} // Especificar el ID único de fila
                            sx={{
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                },
                                '& .MuiDataGrid-row:nth-of-type(odd)': {
                                    backgroundColor: 'action.hover',
                                },
                                border: '1px solid',
                                borderColor: 'divider',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                },
                                '& .MuiDataGrid-columnHeader': {
                                     borderRight: '1px solid',
                                     borderColor: 'divider',
                                },
                                '& .MuiDataGrid-columnHeader:last-child': {
                                     borderRight: 'none', // Quitar borde en la última cabecera
                                },
                                // Asegurar que no haya doble borde inferior en la última fila
                                '& .MuiDataGrid-virtualScrollerRenderZone > .MuiDataGrid-row:last-of-type > .MuiDataGrid-cell': {
                                    borderBottom: 'none',
                                },
                            }}
                        />
                    </Paper>

                    {/* --- SECCIÓN DE RESUMEN ANUAL --- */}
                    {/* Renderizar siempre el componente, él decide si mostrar datos o mensaje */}
                    <ResumenAnual data={rows} />

                </> // Fin del fragmento
            )}
        </Container>
    );
}

export default ReporteCursosCC;