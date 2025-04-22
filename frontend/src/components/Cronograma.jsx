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

// Estilos del modal
const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '80%', maxWidth: 600, bgcolor: 'background.paper', border: 'none',
  borderRadius: 2, boxShadow: 24, p: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
};

// Labels de meses
const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const Cronograma = () => {
  // estados
  const [cursosData, setCursosData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [originalHeaders, setOriginalHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  // filtros
  const [ministerioOptions, setMinisterioOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [ministerioFilter, setMinisterioFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [nombreFilter, setNombreFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');

  // columnas que vemos
  const COLUMNAS_VISIBLES = useMemo(() => [
    "Ministerio","Area","Nombre del curso",
    "Fecha inicio de inscripción","Fecha fin de inscripción",
    "Fecha inicio del curso","Fecha fin del curso"
  ], []);

  // generar def de columnas para DataGrid
  const columnsForGrid = useMemo(() => {
    if (!originalHeaders.length) return [];
    return originalHeaders
      .filter(h => COLUMNAS_VISIBLES.includes(h))
      .map(header => {
        let flex = 1;
        if (header === "Nombre del curso") flex = 2.5;
        if (header === "Ministerio" || header === "Area") flex = 1.5;
        if (header.toLowerCase().includes("fecha")) flex = 1.2;
        return { field: header, headerName: header, flex, minWidth: 130 };
      });
  }, [originalHeaders]);

  // carga inicial
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const dataCronograma = await getCronograma();
        if (!dataCronograma || dataCronograma.length < 2) {
          throw new Error("No se recibieron datos válidos del cronograma.");
        }
        const headers = dataCronograma[0].map(h => h.trim());
        setOriginalHeaders(headers);

        const minSet = new Set();
        const areaSet = new Set();
        const dataObjs = dataCronograma.slice(1).map((row, idx) => {
          const obj = { id: idx };
          headers.forEach((h, i) => {
            const val = row[i] != null ? String(row[i]).trim() : '';
            obj[h] = val;
            if (h === "Ministerio" && val) minSet.add(val);
            if (h === "Area" && val) areaSet.add(val);
          });
          return obj;
        });

        setCursosData(dataObjs);
        setFilteredData(dataObjs);
        setMinisterioOptions(['all', ...Array.from(minSet).sort()]);
        setAreaOptions(['all', ...Array.from(areaSet).sort()]);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // efecto filtros
  useEffect(() => {
    let data = cursosData;

    if (ministerioFilter !== 'all') {
      data = data.filter(c => c["Ministerio"] === ministerioFilter);
    }
    if (areaFilter !== 'all') {
      data = data.filter(c => c["Area"] === areaFilter);
    }
    if (nombreFilter.trim()) {
      const term = nombreFilter.trim().toLowerCase();
      data = data.filter(c => c["Nombre del curso"]?.toLowerCase().includes(term));
    }
    if (monthFilter !== 'all') {
      data = data.filter(c => {
        const f = c["Fecha inicio del curso"];
        if (!f) return false;
        const d = dayjs(f, 'DD/MM/YYYY');
        return d.isValid() && d.month() === parseInt(monthFilter, 10);
      });
    }

    setFilteredData(data);
  }, [cursosData, ministerioFilter, areaFilter, nombreFilter, monthFilter]);

  // handlers
  const handleRowDoubleClick = params => {
    // tomo la fila completa desde cursosData (tiene todos los headers)
    const full = cursosData.find(c => c.id === params.row.id);
    setSelectedRowData(full || params.row);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
  };
  const handleDescargarExcel = async () => {
    if (!filteredData.length) return;
    setLoading(true);
    try {
      const headersVis = columnsForGrid.map(c => c.headerName);
      await descargarExcel(filteredData, headersVis, "Cronograma_Filtrado");
    } catch (e) {
      console.error(e);
      setError("Error al generar el Excel.");
    } finally {
      setLoading(false);
    }
  };
  const handleMinisterioChange = e => setMinisterioFilter(e.target.value);
  const handleAreaChange = e => setAreaFilter(e.target.value);
  const handleNombreChange = e => setNombreFilter(e.target.value);
  const handleMonthChange = e => setMonthFilter(e.target.value);

  // render
  if (loading && !cursosData.length) {
    return (
      <Backdrop open sx={{ zIndex: t => t.zIndex.drawer + 1, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }
  if (error) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh', p:3 }}>
        <Paper elevation={3} sx={{ p:4, textAlign:'center' }}>
          <Typography variant="h6" color="error" gutterBottom>Error</Typography>
          <Typography>{error}</Typography>
        </Paper>
      </Box>
    );
  }
  if (!loading && !cursosData.length) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh', p:3 }}>
        <Paper elevation={3} sx={{ p:4, textAlign:'center' }}>
          <Typography variant="h6" gutterBottom>No Hay Datos</Typography>
          <Typography>No se encontraron datos en el cronograma.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Título y descarga */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2, flexWrap:'wrap', gap:2 }}>
        <Titulo texto="Cronograma" />
        <BotonCircular
          icon="descargar"
          onClick={handleDescargarExcel}
          tooltip="Descargar Vista Actual"
          disabled={loading || !filteredData.length}
        />
      </Box>
      <Divider sx={{ mb:3, borderBottomWidth:2 }} />

      {/* Filtros */}
      <Paper elevation={1} sx={{ p:2, mb:3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth label="Buscar por Nombre del Curso"
              size="small" value={nombreFilter}
              onChange={handleNombreChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={loading || ministerioOptions.length<=1}>
              <InputLabel id="ministerio-filter-label">Ministerio</InputLabel>
              <Select
                labelId="ministerio-filter-label"
                value={ministerioFilter}
                label="Ministerio"
                onChange={handleMinisterioChange}
              >
                {ministerioOptions.map((opt,i)=>(
                  <MenuItem key={i} value={opt}>{opt==='all'?<em>Todos</em>:opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={loading || areaOptions.length<=1}>
              <InputLabel id="area-filter-label">Área</InputLabel>
              <Select
                labelId="area-filter-label"
                value={areaFilter}
                label="Área"
                onChange={handleAreaChange}
              >
                {areaOptions.map((opt,i)=>(
                  <MenuItem key={i} value={opt}>{opt==='all'?<em>Todas</em>:opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={loading}>
              <InputLabel id="mes-filter-label">Mes Inicio Curso</InputLabel>
              <Select
                labelId="mes-filter-label"
                value={monthFilter}
                label="Mes Inicio Curso"
                onChange={handleMonthChange}
              >
                <MenuItem value="all"><em>Todos</em></MenuItem>
                {MONTH_NAMES.map((m,i)=>(
                  <MenuItem key={i} value={i.toString()}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Procesando */}
      {loading && cursosData.length>0 && (
        <Box sx={{ display:'flex', justifyContent:'center', my:2 }}>
          <CircularProgress size={24} sx={{ mr:1 }} />
          <Typography>Procesando...</Typography>
        </Box>
      )}

      {/* DataGrid */}
      <Paper elevation={3} sx={{ height:600, width:'100%' }}>
        <DataGrid
          rows={filteredData}
          columns={columnsForGrid}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          onRowDoubleClick={handleRowDoubleClick}
          getRowId={r=>r.id}
          density="compact"
          disableSelectionOnClick
          initialState={{
            sorting: { sortModel:[{ field:'Fecha inicio del curso', sort:'asc' }] }
          }}
          sx={{
            border:0,
            '& .MuiDataGrid-columnHeaders':{ backgroundColor:'primary.main', color:'#000', fontWeight:'bold' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within':{ outline:'none!important' },
            '& .MuiDataGrid-row':{ cursor:'pointer' },
            '& .MuiDataGrid-overlay':{ backgroundColor:'rgba(255,255,255,0.7)' }
          }}
          slots={{
            noRowsOverlay:() => (
              <Box sx={{ mt:10, display:'flex', justifyContent:'center', alignItems:'center', height:'100%' }}>
                <Typography>No hay cursos que coincidan con los filtros.</Typography>
              </Box>
            )
          }}
        />
      </Paper>

      {/* Modal detalle */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedRowData && (
            <Card sx={{ display:'flex', flexDirection:'column', flexGrow:1, overflow:'hidden' }}>
              <CardHeader
                avatar={<InfoIcon color="primary" />}
                title={selectedRowData["Nombre del curso"]||"Detalle del Curso"}
                titleTypographyProps={{ variant:'h6', fontWeight:'bold' }}
                subheader={selectedRowData["Código del curso"]||''}
                action={<IconButton onClick={handleCloseModal}><CloseIcon/></IconButton>}
                sx={{ borderBottom:1, borderColor:'divider', pb:1 }}
              />
              <CardContent sx={{ overflowY:'auto', flexGrow:1 }}>
                <List dense>
                  {originalHeaders.map(h => {
                    if (h==='id') return null;
                    const val = selectedRowData[h];
                    if (val) {
                      return (
                        <React.Fragment key={h}>
                          <ListItem sx={{ py:0.5 }}>
                            <ListItemText
                              primary={val}
                              secondary={h}
                              primaryTypographyProps={{ fontWeight:500 }}
                              secondaryTypographyProps={{ fontSize:'0.8rem' }}
                            />
                          </ListItem>
                          <Divider component="li" variant="inset" sx={{ ml:0 }}/>
                        </React.Fragment>
                      );
                    }
                    return null;
                  })}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Cronograma;
