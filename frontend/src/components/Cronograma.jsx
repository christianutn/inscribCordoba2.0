import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { getCronograma } from "../services/googleSheets.service.js";
import { descargarExcel } from "../services/excel.service.js";
// --- MUI Imports ---
import {
  DataGrid,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
// --- Icons ---
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
// --- Custom Components ---
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Titulo from "../components/fonts/TituloPrincipal.jsx";
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const VISIBLE_COLUMN_HEADERS = [
    "Ministerio", "Area", "Codigo del curso", "Nombre del curso",
    "Fecha inicio de inscripción", "Fecha fin de inscripción",
    "Fecha inicio del curso", "Fecha fin del curso"
];
const FILTER_COLUMN_MINISTERIO = "Ministerio";
const FILTER_COLUMN_AREA = "Area";
const FILTER_COLUMN_NOMBRE_CURSO = "Nombre del curso";
const ALL_OPTION_VALUE = '';
const ALL_OPTION_LABEL = 'Todos';

const Cronograma = () => {
    const [allHeaders, setAllHeaders] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [gridRows, setGridRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [ministerioFilter, setMinisterioFilter] = useState(ALL_OPTION_VALUE);
    const [areaFilter, setAreaFilter] = useState(ALL_OPTION_VALUE);
    const [nombreCursoFilter, setNombreCursoFilter] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [ministerioColIndex, setMinisterioColIndex] = useState(-1);
    const [areaColIndex, setAreaColIndex] = useState(-1);
    const [nombreCursoColIndex, setNombreCursoColIndex] = useState(-1);
    const [ministerioOptions, setMinisterioOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);

    const theme = useTheme();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const dataCronograma = await getCronograma();

                if (dataCronograma && dataCronograma.length > 0) {
                    const headers = dataCronograma[0];
                    const dataRows = dataCronograma.slice(1);
                    setAllHeaders(headers);

                    const minIndex = headers.findIndex(h => String(h).trim() === FILTER_COLUMN_MINISTERIO);
                    const areaIndex = headers.findIndex(h => String(h).trim() === FILTER_COLUMN_AREA);
                    const nombreIndex = headers.findIndex(h => String(h).trim() === FILTER_COLUMN_NOMBRE_CURSO);
                    setMinisterioColIndex(minIndex);
                    setAreaColIndex(areaIndex);
                    setNombreCursoColIndex(nombreIndex);

                    const columnsToShow = headers
                        .map((header, index) => ({ header, index }))
                        .filter(({ header }) => VISIBLE_COLUMN_HEADERS.includes(String(header).trim()))
                        .map(({ header, index }) => ({ field: `col${index}`, headerName: header, flex: 1, minWidth: 140 }));
                    setVisibleColumns(columnsToShow);

                    const allFormattedRows = dataRows.map((row, rowIndex) => {
                        const rowObject = { id: rowIndex };
                        row.forEach((cell, cellIndex) => { rowObject[`col${cellIndex}`] = cell ?? ''; });
                        return rowObject;
                    });
                    setGridRows(allFormattedRows);

                    if (minIndex !== -1) {
                        const uniqueMin = [...new Set(allFormattedRows.map(row => String(row[`col${minIndex}`]).trim()).filter(Boolean))]
                            .sort((a, b) => a.localeCompare(b));
                        setMinisterioOptions(uniqueMin);
                    }

                } else {
                    setAllHeaders([]); setVisibleColumns([]); setGridRows([]);
                    setMinisterioColIndex(-1); setAreaColIndex(-1); setNombreCursoColIndex(-1);
                    setMinisterioOptions([]); setAreaOptions([]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching cronograma:", error); setLoading(false);
                setAllHeaders([]); setVisibleColumns([]); setGridRows([]);
                setMinisterioColIndex(-1); setAreaColIndex(-1); setNombreCursoColIndex(-1);
                setMinisterioOptions([]); setAreaOptions([]);
            }
        })();
    }, []);

    useEffect(() => {
        if (gridRows.length === 0 || ministerioColIndex === -1 || areaColIndex === -1) {
            setAreaOptions([]);
            return;
        }

        if (ministerioFilter === ALL_OPTION_VALUE) {
            setAreaOptions([]);
            setAreaFilter(ALL_OPTION_VALUE);
        } else {
            const relevantRows = gridRows.filter(row => String(row[`col${ministerioColIndex}`]) === ministerioFilter);
            const uniqueAreas = [...new Set(relevantRows.map(row => String(row[`col${areaColIndex}`]).trim()).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b));
            setAreaOptions(uniqueAreas);
            setAreaFilter(ALL_OPTION_VALUE);
        }
    }, [ministerioFilter, gridRows, ministerioColIndex, areaColIndex]);


    useEffect(() => {
        let currentFilteredRows = [...gridRows];

        if (ministerioColIndex !== -1 && ministerioFilter !== ALL_OPTION_VALUE) {
            currentFilteredRows = currentFilteredRows.filter(row =>
                String(row[`col${ministerioColIndex}`]) === ministerioFilter
            );
        }

        if (areaColIndex !== -1 && areaFilter !== ALL_OPTION_VALUE) {
            currentFilteredRows = currentFilteredRows.filter(row =>
                String(row[`col${areaColIndex}`]) === areaFilter
            );
        }

        if (nombreCursoColIndex !== -1 && nombreCursoFilter) {
            currentFilteredRows = currentFilteredRows.filter(row =>
                String(row[`col${nombreCursoColIndex}`]).toLowerCase().includes(nombreCursoFilter.toLowerCase())
            );
        }

        setFilteredRows(currentFilteredRows);

    }, [gridRows, ministerioFilter, areaFilter, nombreCursoFilter, ministerioColIndex, areaColIndex, nombreCursoColIndex]);


    const handleRowClick = (params) => { setSelectedRowData(params.row); setModalOpen(true); };
    const handleCloseModal = () => { setModalOpen(false); setSelectedRowData(null); };
    const handleDescargarExcel = async () => {
        if (filteredRows.length === 0 || allHeaders.length === 0) { console.warn("No data available to download."); return; }
        const excelColumns = allHeaders.map((header, index) => ({ field: `col${index}`, headerName: header }));
        await descargarExcel(filteredRows, excelColumns, "Cronograma_Filtrado");
    };
    const handleClearFilters = () => {
        setMinisterioFilter(ALL_OPTION_VALUE);
        setAreaFilter(ALL_OPTION_VALUE);
        setNombreCursoFilter('');
    };


    if (loading) {
        return (<Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}><CircularProgress color="inherit" /></Backdrop>);
    }

    return (
        <div className="container-cronograma" style={{ padding: '20px' }}>

            <div className="cabecera" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <Titulo texto="Cronograma" />
                <BotonCircular icon="descargar" onClick={handleDescargarExcel} tooltip="Descargar Vista Actual (Excel)" />
            </div>
            <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} />

            <Box sx={{ mb: 3, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" variant="outlined" disabled={ministerioColIndex === -1 || ministerioOptions.length === 0}>
                            <InputLabel id="ministerio-filter-label">{FILTER_COLUMN_MINISTERIO}</InputLabel>
                            <Select
                                labelId="ministerio-filter-label"
                                value={ministerioFilter}
                                label={FILTER_COLUMN_MINISTERIO}
                                onChange={(e) => setMinisterioFilter(e.target.value)}
                            >
                                <MenuItem value={ALL_OPTION_VALUE}><em>{ALL_OPTION_LABEL}</em></MenuItem>
                                {ministerioOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" variant="outlined"
                            disabled={areaColIndex === -1 || ministerioFilter === ALL_OPTION_VALUE || areaOptions.length === 0}
                        >
                            <InputLabel id="area-filter-label">{FILTER_COLUMN_AREA}</InputLabel>
                            <Select
                                labelId="area-filter-label"
                                value={areaFilter}
                                label={FILTER_COLUMN_AREA}
                                onChange={(e) => setAreaFilter(e.target.value)}
                            >
                                <MenuItem value={ALL_OPTION_VALUE}>
                                    <em>{ALL_OPTION_LABEL}</em>
                                </MenuItem>
                                {areaOptions.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <TextField fullWidth size="small" variant="outlined" label={FILTER_COLUMN_NOMBRE_CURSO} value={nombreCursoFilter} onChange={(e) => setNombreCursoFilter(e.target.value)} disabled={nombreCursoColIndex === -1} />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2} sx={{ textAlign: { xs: 'right', md: 'left' } }}>
                        <Button variant="outlined" size="small" onClick={handleClearFilters} startIcon={<ClearIcon />} disabled={ministerioFilter === ALL_OPTION_VALUE && areaFilter === ALL_OPTION_VALUE && !nombreCursoFilter} >
                            Limpiar
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <div className="cronograma" style={{ height: 550, width: '100%' }}>
                <DataGrid
                    rows={filteredRows}
                    columns={visibleColumns}
                    pageSize={15}
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    autoHeight={false}
                    onRowClick={handleRowClick}
                    disableSelectionOnClick
                    density="compact"
                    localeText={{ noRowsLabel: 'No se encontraron resultados con los filtros aplicados' }}
                    sx={{
                        '& .MuiDataGrid-row:hover': { cursor: 'pointer', backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        '& .MuiDataGrid-cell': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                        '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }
                    }}
                />
            </div>

            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth aria-labelledby="detail-dialog-title" scroll="paper">
                <DialogTitle id="detail-dialog-title" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1.5 }}>
                    Detalles Completos del Curso
                </DialogTitle>
                <DialogContent sx={{ py: 2, backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#333' }}>
                    {selectedRowData && allHeaders.length > 0 ? (
                        <Box component="dl" sx={{ m: 0 }}>
                            {allHeaders.map((header, index) => {
                                const cellValue = selectedRowData[`col${index}`] ?? '';
                                if (!header) return null;
                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'grid', gridTemplateColumns: 'minmax(150px, 30%) 1fr',
                                            gap: theme.spacing(1, 2), alignItems: 'center', py: 1.5, px: 1,
                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                            '&:last-of-type': { borderBottom: 'none' },
                                        }}
                                    >
                                        <Typography component="dt" variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, textAlign: 'left' }}>
                                            {header}:
                                        </Typography>
                                        <Typography component="dd" variant="body1" sx={{ color: theme.palette.text.secondary, textAlign: 'left', wordBreak: 'break-word', m: 0 }}>
                                            {cellValue === '' ? '-' : String(cellValue)}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    ) : (
                        <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                            No hay detalles disponibles para mostrar.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button onClick={handleCloseModal} variant="contained" color="primary" autoFocus>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
}

export default Cronograma;