import React, { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { Backdrop, CircularProgress, Box, Typography, Paper, Divider, Alert, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import InfoIcon from '@mui/icons-material/Info';

import { descargarExcelCronograma as descargarExcel } from "../services/excel.service.js";
import { putInstancia } from "../services/instancias.service.js";

import BotonCircular from "./UIElements/BotonCircular.jsx";
import Titulo from "./fonts/TituloPrincipal.jsx";

import { useCronogramaData } from '../hooks/useCronogramaData';
import { useCronogramaFilters } from '../hooks/useCronogramaFilters';

import { formatBooleanToSiNo } from './Cronograma/utils';
import FilterBar from './Cronograma/FilterBar';
import DetalleInstanciaModal from './Cronograma/Modals/DetalleInstanciaModal';

import CambiarEstadoModal from './Cronograma/Modals/CambiarEstadoModal';
import CambiarFechasModal from './Cronograma/Modals/CambiarFechasModal';
import OtrosModal from './Cronograma/Modals/OtrosModal';
import ConfirmacionDialog from './Cronograma/Modals/ConfirmacionDialog';
import GestionarRestriccionesModal from './Cronograma/Modals/GestionarRestriccionesModal';
import CambiarComentariosModal from './Cronograma/Modals/CambiarComentariosModal';
import CambiarCupoModal from './Cronograma/Modals/CambiarCupoModal.jsx';
import CambiarMedioInscripcionModal from './Cronograma/Modals/CambiarMedioInscripcionModal.jsx';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('es');

const CronogramaGAReducido = () => {
    const [successMessage, setSuccessMessage] = useState('');
    const {
        cursosData, loading: dataLoading, error: dataError, fetchData, allUsers, adminUsers,
        allEstados, allCursos, allDepartamentos, allMediosInscripcion, ministerioOptions, setError
    } = useCronogramaData();

    const {
        filteredData, filters, setFilters, areaOptions, handleClearFilters, isFilterActive
    } = useCronogramaFilters(cursosData, dataLoading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

    // States for modals
    const [estadoModalOpen, setEstadoModalOpen] = useState(false);
    const [fechasModalOpen, setFechasModalOpen] = useState(false);
    const [otrosModalOpen, setOtrosModalOpen] = useState(false);
    const [restrictionsModalOpen, setRestrictionsModalOpen] = useState(false);
    const [autogestionadoConfirmOpen, setAutogestionadoConfirmOpen] = useState(false);
    const [comentariosModalOpen, setComentariosModalOpen] = useState(false);
    const [publicadaModalOpen, setPublicadaModalOpen] = useState(false);
    const [cupoModalOpen, setCupoModalOpen] = useState(false)
    const [medioInscripcionModalOpen, setMedioInscripcionModalOpen] = useState(false);


    // Loading states for modal actions
    const [loadingAction, setLoadingAction] = useState(false);

    const GA_COLUMNS = [
        "ID del evento",
        "Nombre del curso",
        "Fecha inicio inscripción",
        "Fecha fin inscripción",
        "Fecha inicio del curso",
        "Fecha fin del curso",
        "Es Autogestionado",
        "Publica en portal",
        "Medio de inscripción",
        "Ministerio",
        "Area"
    ];

    const columnsForGrid = useMemo(() => {
        return GA_COLUMNS.map(headerKey => {
            let flex = 1;
            let minWidth = 130;
            let valueFormatter = undefined;

            if (headerKey === "Nombre del curso") { flex = 2.0; minWidth = 220; }
            if (headerKey === "Ministerio") { flex = 1.5; minWidth = 180; }
            if (headerKey === "Area") { flex = 1.5; minWidth = 180; }
            if (headerKey === "Medio de inscripción") { flex = 1.2; minWidth = 150; }
            if (headerKey === "Es Autogestionado") { flex = 0.7; minWidth = 110; }

            if (headerKey.toLowerCase().includes("fecha")) {
                flex = 1.0;
                minWidth = 140;
                valueFormatter = (value) => {
                    if (!value) return '';
                    const d = dayjs(value);
                    return d.isValid() ? d.format('DD/MM/YYYY') : value;
                };
            }
            if (headerKey === "ID del evento") { flex = 0.7; minWidth = 100; }
            return { field: headerKey, headerName: headerKey, flex, minWidth, valueFormatter };
        }).filter(Boolean);
    }, []);

    const handleRowClick = useCallback(params => {
        setSelectedRowData(params.row);
        setModalOpen(true);
    }, []);

    const handleCloseAllModals = useCallback(() => {
        setModalOpen(false);
        setEstadoModalOpen(false);
        setFechasModalOpen(false);
        setOtrosModalOpen(false);
        setRestrictionsModalOpen(false);
        setAutogestionadoConfirmOpen(false);
        setComentariosModalOpen(false);
        setPublicadaModalOpen(false);
        setLoadingAction(false);
        setCupoModalOpen(false);
        setMedioInscripcionModalOpen(false);
        // No limpiar selectedRowData aquí para que el modal principal no parpadee al cerrar los sub-modales
    }, []);

    const handleApiUpdate = useCallback(async (payload) => {
        if (!selectedRowData?.originalInstancia) {
            setError("No hay una instancia seleccionada para actualizar.");
            return false;
        }
        setError(null);
        setSuccessMessage('');
        setLoadingAction(true);
        try {
            const { curso, fecha_inicio_curso } = selectedRowData.originalInstancia;
            await putInstancia(curso, fecha_inicio_curso, payload);
            return true;
        } catch (err) {
            console.error("Error en putInstancia:", err);
            setError(err.response?.data?.message || err.message || "Error al actualizar la instancia.");
            return false;
        } finally {
            setLoadingAction(false);
        }
    }, [selectedRowData, setError]);

    const createUpdateHandler = (successMessage, payloadFn) => async (data) => {
        const payload = payloadFn(data);
        const success = await handleApiUpdate(payload);
        if (success) {
            setSuccessMessage(successMessage(data));
            handleCloseAllModals();
            fetchData();
        }
    };


    const handleUpdateEstado = createUpdateHandler(
        (estadoCod) => `Estado actualizado a "${allEstados.find(e => e.cod === estadoCod)?.descripcion || estadoCod}" exitosamente.`,
        (estadoCod) => ({ estado_instancia: estadoCod })
    );

    const handleUpdateFechas = createUpdateHandler(
        () => "Fechas actualizadas exitosamente.",
        (fechas) => {
            const payload = {};
            Object.keys(fechas).forEach(key => {
                const newDate = fechas[key];
                const originalDateStr = selectedRowData?.originalInstancia?.[key];
                const newDateStr = newDate && dayjs(newDate).isValid() ? dayjs(newDate).format('YYYY-MM-DD') : null;
                if (newDateStr !== originalDateStr) payload[key] = newDateStr;
            });
            return payload;
        }
    );

    const handleUpdateOtros = createUpdateHandler(
        () => 'Cantidad de inscriptos modificada con éxito',
        (data) => data
    );



    const handleUpdateRestrictions = createUpdateHandler(
        () => "Restricciones actualizadas exitosamente.",
        (payload) => payload
    );

    const handleConfirmToggleAutogestionado = async () => {
        const currentValue = selectedRowData?.originalInstancia?.es_autogestionado;
        const newValue = currentValue === 1 ? 0 : 1;
        const success = await handleApiUpdate({ es_autogestionado: newValue });
        if (success) {
            setSuccessMessage(`El estado 'Autogestionado' se cambió a "${formatBooleanToSiNo(newValue)}" exitosamente.`);
            handleCloseAllModals();
            fetchData();
        }
    };

    const handleUpdateComentarios = createUpdateHandler(
        () => "Comentario actualizado exitosamente.",
        (data) => data
    );

    const handleConfirmTogglePublicada = async () => {
        const currentValue = selectedRowData?.originalInstancia?.es_publicada_portal_cc;
        const newValue = currentValue === 1 ? 0 : 1;
        const success = await handleApiUpdate({ es_publicada_portal_cc: newValue });
        if (success) {
            setSuccessMessage(`El estado 'Publicada en Portal' se cambió a "${formatBooleanToSiNo(newValue)}" exitosamente.`);
            handleCloseAllModals();
            fetchData();
        }
    };

    const handleUpdateCupo = createUpdateHandler(
        () => "Cupo actualizado exitosamente.",
        (data) => data
    );

    const handleUpdateMedioInscripcion = createUpdateHandler(
        (medioCod) => `Medio de inscripción actualizado a "${allMediosInscripcion.find(m => m.cod === medioCod)?.nombre || medioCod}" exitosamente.`,
        (medioCod) => ({ medio_inscripcion: medioCod })
    );



    const handleDescargarExcel = useCallback(async () => {
        if (!filteredData.length) return;
        try {
            await descargarExcel(filteredData, GA_COLUMNS, "Cronograma_Admin_Reducido");
        } catch (error) {
            setError("Error al generar el archivo Excel.");
            console.error(error);
        }
    }, [filteredData, GA_COLUMNS, setError]);

    const getRowClassName = useCallback((params) => {
        const estado = params.row["Estado"];
        if (estado === 'CANC') return 'row-cancelado';
        return '';
    }, []);

    if (dataLoading && !cursosData.length) return (<Backdrop open sx={{ zIndex: t => t.zIndex.drawer + 1, color: '#fff' }}><CircularProgress color="inherit" /></Backdrop>);
    if (dataError && !successMessage) return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}><Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6" color="error" gutterBottom>Error</Typography><Typography>{dataError}</Typography><Button onClick={fetchData} sx={{ mt: 2 }}>Reintentar</Button></Paper></Box>);
    if (!dataLoading && !dataError && cursosData.length === 0) return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}><Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6" gutterBottom>No Hay Datos</Typography><Typography>No se encontraron datos en el cronograma.</Typography></Paper></Box>);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <div style={{ padding: 20 }}>
                {successMessage && <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>{successMessage}</Alert>}
                {dataError && !successMessage && <Alert severity="error" onClose={() => { setError(null); setSuccessMessage(''); }} sx={{ mb: 2 }}>{dataError}</Alert>}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Titulo texto="Cronograma Gestión Académica" />
                    <BotonCircular icon="descargar" onClick={handleDescargarExcel} tooltip="Descargar Vista Actual" disabled={dataLoading || !filteredData.length} />
                </Box>
                <Divider sx={{ mb: 3, borderBottomWidth: 2 }} />

                <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    ministerioOptions={ministerioOptions}
                    areaOptions={areaOptions}
                    handleClearFilters={handleClearFilters}
                    isFilterActive={isFilterActive}
                    loading={dataLoading}
                />

                {dataLoading && (<Box sx={{ display: 'flex', justifyContent: 'center', my: 2, alignItems: 'center' }}><CircularProgress size={20} sx={{ mr: 1 }} /><Typography variant="body2" color="text.secondary">Actualizando tabla...</Typography></Box>)}

                <Paper elevation={3} sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredData}
                        columns={columnsForGrid}
                        onRowClick={handleRowClick}
                        getRowId={r => r.id}
                        loading={dataLoading}
                        density="compact"
                        disableRowSelectionOnClick
                        getRowClassName={getRowClassName}
                        initialState={{ sorting: { sortModel: [{ field: 'Fecha inicio inscripción', sort: 'asc' }] } }}
                        sx={{
                            border: 0,
                            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'primary.light', color: 'text.primary' },
                            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none!important' },
                            '& .MuiDataGrid-row': { cursor: 'pointer' },
                            '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover', },
                            '& .MuiDataGrid-overlay': { backgroundColor: 'rgba(255,255,255,0.7)' },
                            '& .row-cancelado': {
                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                borderLeft: '4px solid #d32f2f',
                                color: '#b71c1c',
                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.15)', },
                                '& .MuiDataGrid-cell': { color: '#b71c1c', },
                            },
                        }}
                        slots={{ noRowsOverlay: () => (<Box sx={{ mt: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', p: 2 }}><InfoIcon color="action" sx={{ mb: 1, fontSize: '3rem' }} /><Typography align="center">{cursosData.length === 0 ? "No hay datos disponibles." : "No hay cursos que coincidan."}</Typography></Box>) }}
                    />
                </Paper>

                <DetalleInstanciaModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    selectedRowData={selectedRowData}
                    onOpenEstadoModal={() => setEstadoModalOpen(true)}
                    onOpenOtrosModal={() => setOtrosModalOpen(true)}
                    onOpenRestrictionsModal={() => setRestrictionsModalOpen(true)}
                    onToggleAutogestionado={() => setAutogestionadoConfirmOpen(true)}
                    onOpenFechasModal={() => setFechasModalOpen(true)}
                    onOpenComentariosModal={() => setComentariosModalOpen(true)}
                    onOpenPublicadaModal={() => setPublicadaModalOpen(true)}
                    onOpenCupoModal={() => setCupoModalOpen(true)}
                    onOpenMedioInscripcionModal={() => setMedioInscripcionModalOpen(true)}
                    showReasignar={false}
                    showCambiarFechas={false}
                />


                <CambiarEstadoModal
                    open={estadoModalOpen}
                    onClose={handleCloseAllModals}
                    onUpdate={handleUpdateEstado}
                    loading={loadingAction}
                    selectedRowData={selectedRowData}
                    allEstados={allEstados}
                />

                <CambiarFechasModal
                    open={fechasModalOpen}
                    onClose={handleCloseAllModals}
                    onUpdate={handleUpdateFechas}
                    loading={loadingAction}
                    selectedRowData={selectedRowData}
                />

                <OtrosModal
                    open={otrosModalOpen}
                    onClose={handleCloseAllModals}
                    onUpdate={handleUpdateOtros}
                    loading={loadingAction}
                    selectedRowData={selectedRowData}
                />

                <GestionarRestriccionesModal
                    open={restrictionsModalOpen}
                    onClose={handleCloseAllModals}
                    onUpdate={handleUpdateRestrictions}
                    loading={loadingAction}
                    selectedRowData={selectedRowData}
                    allCursos={allCursos}
                    allDepartamentos={allDepartamentos}
                />

                <CambiarComentariosModal
                    open={comentariosModalOpen}
                    onClose={handleCloseAllModals}
                    onUpdate={handleUpdateComentarios}
                    loading={loadingAction}
                    selectedRowData={selectedRowData}
                />

                <CambiarCupoModal
                    open={cupoModalOpen}
                    onClose={handleCloseAllModals}
                    onUpdate={handleUpdateCupo}
                    loading={loadingAction}
                    selectedRowData={selectedRowData}
                />

                <ConfirmacionDialog
                    open={publicadaModalOpen}
                    onClose={handleCloseAllModals}
                    onConfirm={handleConfirmTogglePublicada}
                    title="Confirmar Cambio"
                    loading={loadingAction}
                >
                    Está a punto de cambiar el estado 'Es Publicada en Portal' de
                    <strong> {formatBooleanToSiNo(selectedRowData?.originalInstancia?.es_publicada_portal_cc)} </strong> a
                    <strong> {formatBooleanToSiNo(!selectedRowData?.originalInstancia?.es_publicada_portal_cc)}</strong>.
                    <Typography sx={{ mt: 2 }}>¿Desea confirmar esta acción?</Typography>
                </ConfirmacionDialog>

                <ConfirmacionDialog
                    open={autogestionadoConfirmOpen}
                    onClose={handleCloseAllModals}
                    onConfirm={handleConfirmToggleAutogestionado}
                    title="Confirmar Cambio"
                    loading={loadingAction}
                >
                    Está a punto de cambiar el estado 'Es Autogestionado' de
                    <strong> {formatBooleanToSiNo(selectedRowData?.originalInstancia?.es_autogestionado)} </strong> a
                    <strong> {formatBooleanToSiNo(!selectedRowData?.originalInstancia?.es_autogestionado)}</strong>.
                    <Typography sx={{ mt: 2 }}>¿Desea confirmar esta acción?</Typography>
                </ConfirmacionDialog>

                <CambiarMedioInscripcionModal
                    open={medioInscripcionModalOpen}
                    onClose={handleCloseAllModals}
                    onUpdate={handleUpdateMedioInscripcion}
                    loading={loadingAction}
                    selectedRowData={selectedRowData}
                    allMedios={allMediosInscripcion}
                />

            </div>
        </LocalizationProvider>
    );
};

export default CronogramaGAReducido;