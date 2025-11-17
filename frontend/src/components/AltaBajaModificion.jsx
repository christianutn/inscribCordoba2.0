import React, { useEffect, useState, useMemo, useCallback, useRef } from "react"; // Importar useRef
import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
import { getCursos } from "../services/cursos.service.js";
import { getMinisterios } from "../services/ministerios.service.js";
import { getAreas } from "../services/areas.service.js";
import { getPersonas } from "../services/personas.service.js";
import { getTutores } from "../services/tutores.service.js";
import { getTiposCapacitacion } from "../services/tiposCapacitacion.service.js";
import { getMediosInscripcion } from "../services/mediosInscripcion.service.js";
import { getPlataformasDictado } from "../services/plataformasDictado.service.js";
import { getUsuarios } from "../services/usuarios.service.js";
import { getRoles } from "../services/roles.service.js";
import { updateRow } from "../services/updateRow.js"
import { deleteRow } from "../services/deleteRow.js"
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from "@mui/x-data-grid";
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Box from '@mui/material/Box';
import { Divider, FormControl, InputLabel, MenuItem, Select as MuiSelect, Button as MuiButton } from '@mui/material';
import Alert from '@mui/material/Alert';
import { descargarExcel } from "../services/excel.service.js";
import { useNavigate } from "react-router-dom";
import { getAreasAsignadas, deleteAreaAsignada, postAreaAsignada } from "../services/areasAsignadasUsuario.service";
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MuiTextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';


const AltaBajaModificion = () => {
    const navigate = useNavigate();
    const options = ["Cursos", "Ministerios", "Áreas", "Personas", "Tutores", "Medios de Inscripción", "Plataformas de Dictado", "Tipos de Capacitación", "Usuarios", "Asignar areas a usuarios"];

    const convertirAPropiedadConfig = (opcion) => {
        switch (opcion) {
            case 'Cursos': return 'cursos';
            case "Ministerios": return 'ministerios';
            case "Áreas": return 'areas';
            case "Personas": return 'personas';
            case "Tutores": return 'tutores';
            case "Medios de Inscripción": return 'mediosInscripcion';
            case "Plataformas de Dictado": return 'plataformasDictado';
            case "Tipos de Capacitación": return 'tiposCapacitaciones';
            case "Usuarios": return 'usuarios';
            case "Asignar areas a usuarios": return 'areasAsignadas';
            default: return '';
        }
    }

    const [selectOption, setSelectOption] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [configuraciones, setConfiguraciones] = useState({});

    const [ministeriosDataState, setMinisteriosDataState] = useState([]);
    const [areasDataState, setAreasDataState] = useState([]);
    const [tiposCapacitacionesDataState, setTiposCapacitacionesDataState] = useState([]);
    const [mediosInscripcionDataState, setMediosInscripcionDataState] = useState([]);
    const [plataformasDictadoDataState, setPlataformasDictadoDataState] = useState([]);
    const [rolesDataState, setRolesDataState] = useState([]);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUserCuil, setSelectedUserCuil] = useState(null);
    const [areaFilterDialog, setAreaFilterDialog] = useState('');
    const [areasDisponibles, setAreasDisponibles] = useState([]);

    const [filtroGeneralInput, setFiltroGeneralInput] = useState("");

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentEditingRow, setCurrentEditingRow] = useState(null);
    const [editedRowData, setEditedRowData] = useState({});

    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    
    // --- Lógica para forzar re-renderizado de la tabla ---
    const containerRef = useRef(null); // <-- CORRECCIÓN AQUÍ: SE VUELVE A AÑADIR LA DECLARACIÓN
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries && entries.length > 0) {
                const { width, height } = entries[0].contentRect;
                setContainerSize({ width, height });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setCargando(true);
        (async () => {
            try {
                const [
                    cursosRes, ministeriosRes, areasRes, personasRes, tutoresRes,
                    tiposCapacitacionesRes, mediosInscripcionRes, plataformasDictadoRes,
                    usuariosRes, rolesRes, areasAsignadasRes
                ] = await Promise.all([
                    getCursos(), getMinisterios(), getAreas(), getPersonas(), getTutores(),
                    getTiposCapacitacion(), getMediosInscripcion(), getPlataformasDictado(),
                    getUsuarios(), getRoles(), getAreasAsignadas()
                ]);

                setMinisteriosDataState(ministeriosRes);
                setAreasDataState(areasRes);
                setTiposCapacitacionesDataState(tiposCapacitacionesRes);
                setMediosInscripcionDataState(mediosInscripcionRes);
                setPlataformasDictadoDataState(plataformasDictadoRes);
                setRolesDataState(rolesRes);

                setConfiguraciones({
                    cursos: {
                        columns: [
                            { field: 'cod', headerName: 'Código', width: 120 },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            { field: 'cupo', headerName: 'Cupo', width: 100, type: 'number', editable: true },
                            {
                                field: 'plataformaDictado', headerName: 'Pataforma de dictado', width: 180, editable: true,
                                type: 'select', options: plataformasDictadoRes.map(e => ({ value: e.nombre, label: e.nombre })),
                            },
                            {
                                field: 'medioInscripcion', headerName: 'Medio de inscripción', width: 180, editable: true,
                                type: 'select', options: mediosInscripcionRes.map(e => ({ value: e.nombre, label: e.nombre })),
                            },
                            {
                                field: 'tipoCapacitacion', headerName: 'Tipo de capacitación', width: 180, editable: true,
                                type: 'select', options: tiposCapacitacionesRes.map(e => ({ value: e.nombre, label: e.nombre })),
                            },
                            { field: 'horas', headerName: 'Horas', width: 100, type: 'number', editable: true },
                            { field: 'area', headerName: 'Area', width: 180 },
                            { field: 'ministerio', headerName: 'Ministerio', width: 180 },
                            {
                                field: 'esVigente', headerName: '¿Está vigente?', width: 130, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            },
                            {
                                field: 'tiene_evento_creado', headerName: '¿Tiene evento creado?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: cursosRes.map((e) => ({
                            id: e.cod, cod: e.cod, nombre: e.nombre, cupo: e.cupo,
                            plataformaDictado: e.detalle_plataformaDictado?.nombre || 'N/A',
                            medioInscripcion: e.detalle_medioInscripcion?.nombre || 'N/A',
                            tipoCapacitacion: e.detalle_tipoCapacitacion?.nombre || 'N/A',
                            horas: e.cantidad_horas, area: e.detalle_area?.nombre || 'N/A',
                            ministerio: e.detalle_area?.detalle_ministerio?.nombre || 'N/A',
                            esVigente: e.esVigente ? "Si" : "No",
                            tiene_evento_creado: e.tiene_evento_creado ? "Si" : "No",
                        }))
                    },
                    ministerios: {
                        columns: [
                            { field: 'cod', headerName: 'Código', flex: 1, editable: false },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente', headerName: '¿Está vigente?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: ministeriosRes.map((e) => ({ id: e.cod, cod: e.cod, nombre: e.nombre, esVigente: e.esVigente ? "Si" : "No" }))
                    },
                    areas: {
                        columns: [
                            { field: 'cod', headerName: 'Código', flex: 1, editable: false },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            { field: 'ministerio', headerName: 'Ministerio', flex: 1 },
                            {
                                field: 'esVigente', headerName: '¿Está vigente?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: areasRes.map((e) => ({ id: e.cod, cod: e.cod, nombre: e.nombre, ministerio: e.detalle_ministerio?.nombre || 'N/A', esVigente: e.esVigente ? "Si" : "No" }))
                    },
                    personas: {
                        columns: [
                            { field: 'cuil', headerName: 'CUIL', width: 150, editable: true },
                            { field: 'nombre', headerName: 'Nombre', width: 150, editable: true },
                            { field: 'apellido', headerName: 'Apellido', width: 150, editable: true },
                            { field: 'mail', headerName: 'Email', width: 200, editable: true },
                            { field: 'celular', headerName: 'Celular', width: 150, editable: true },
                        ],
                        rows: personasRes.map((p) => ({ id: p.cuil, cuil: p.cuil, nombre: p.nombre, apellido: p.apellido, mail: p.mail, celular: p.celular || "Sin celular" }))
                    },
                    tutores: {
                        columns: [
                            { field: 'cuil', headerName: 'CUIL', width: 150, editable: false },
                            { field: 'nombre', headerName: 'Nombre', width: 150 },
                            { field: 'apellido', headerName: 'Apellido', width: 150 },
                            { field: 'mail', headerName: 'Email', width: 200 },
                            { field: 'celular', headerName: 'Celular', width: 150 },
                            {
                                field: 'area', headerName: 'Área', width: 180, editable: true,
                                type: 'select', options: areasRes.map(a => ({ value: a.nombre, label: a.nombre })),
                            },
                            {
                                field: 'esReferente', headerName: '¿Es Referente?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            },
                        ],
                        rows: tutoresRes.map((t) => ({
                            id: t.cuil, cuil: t.cuil, nombre: t.detalle_persona?.nombre || 'N/A',
                            apellido: t.detalle_persona?.apellido || 'N/A', mail: t.detalle_persona?.mail || 'N/A',
                            celular: t.detalle_persona?.celular || 'Sin celular', area: t.detalle_area?.nombre || 'N/A',
                            esReferente: t.esReferente ? "Si" : "No",
                        }))
                    },
                    mediosInscripcion: {
                        columns: [
                            { field: 'cod', headerName: 'Código', flex: 1, editable: false },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente', headerName: '¿Está vigente?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: mediosInscripcionRes.map(e => ({ id: e.cod, cod: e.cod, nombre: e.nombre, esVigente: e.esVigente ? "Si" : "No" }))
                    },
                    plataformasDictado: {
                        columns: [
                            { field: 'cod', headerName: 'Código', flex: 1, editable: false },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente', headerName: '¿Está vigente?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: plataformasDictadoRes.map(e => ({ id: e.cod, cod: e.cod, nombre: e.nombre, esVigente: e.esVigente ? "Si" : "No" }))
                    },
                    tiposCapacitaciones: {
                        columns: [
                            { field: 'cod', headerName: 'Código', flex: 1, editable: false },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente', headerName: '¿Está vigente?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: tiposCapacitacionesRes.map(e => ({ id: e.cod, cod: e.cod, nombre: e.nombre, esVigente: e.esVigente ? "Si" : "No" }))
                    },
                    usuarios: {
                        columns: [
                            { field: 'cuil', headerName: 'CUIL', width: 150, editable: false },
                            { field: 'nombre', headerName: 'Nombre', width: 150 },
                            { field: 'apellido', headerName: 'Apellido', width: 150 },
                            { field: 'mail', headerName: 'Email', width: 200 },
                            { field: 'celular', headerName: 'Celular', width: 150 },
                            {
                                field: 'area', headerName: 'Área', width: 180, editable: true,
                                type: 'select', options: areasRes.map(a => ({ value: a.nombre, label: a.nombre })),
                            },
                            {
                                field: 'rol', headerName: 'Rol del Usuario', width: 180, editable: true,
                                type: 'select', options: rolesRes.map(r => ({ value: r.nombre, label: r.nombre })),
                            },
                            {
                                field: 'esExcepcionParaFechas', headerName: '¿Es excepción para fechas?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: usuariosRes.map((u) => ({
                            id: u.cuil, cuil: u.cuil, nombre: u.detalle_persona?.nombre || 'N/A',
                            apellido: u.detalle_persona?.apellido || 'N/A', mail: u.detalle_persona?.mail || 'N/A',
                            celular: u.detalle_persona?.celular || 'Sin celular', area: u.detalle_area?.nombre || 'Sin área',
                            rol: u.detalle_rol?.nombre || 'N/A',
                            esExcepcionParaFechas: u.esExcepcionParaFechas == 1 ? 'Si' : 'No',
                        }))
                    },
                    areasAsignadas: {
                        columns: [
                            { field: 'cuil', headerName: 'CUIL', width: 150 },
                            {
                                field: 'areasAsignadas', headerName: 'Áreas asignadas', flex: 1, sortable: false, filterable: false,
                                renderCell: (params) => (
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', p: 0.5, maxHeight: '100px', overflowY: 'auto' }}>
                                        {params.value.map((area) => (
                                            <Tooltip key={area.cod} title={area.nombre} placement="top" arrow>
                                                <Chip label={area.nombre} onDelete={() => handleDeleteAreaAsignada(params.row.cuil, area.cod)} size="small"
                                                    sx={{ '& .MuiChip-label': { maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }} />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                )
                            },
                            {
                                field: 'asignarNueva', headerName: 'Asignar', width: 100, align: 'center', headerAlign: 'center', sortable: false, filterable: false,
                                renderCell: (params) => (
                                    <Tooltip title="Asignar nueva área" placement="top">
                                        <IconButton onClick={() => handleAsignarNuevaArea(params.row.cuil)} color="primary" size="small">
                                            <AddCircleIcon />
                                        </IconButton>
                                    </Tooltip>
                                )
                            }
                        ],
                        rows: areasAsignadasRes.reduce((acc, asignacion) => {
                            if (!asignacion.detalle_usuario || !asignacion.detalle_area) {
                                console.warn("Asignación incompleta omitida:", asignacion); return acc;
                            }
                            const existingRow = acc.find(row => row.cuil === asignacion.detalle_usuario.cuil);
                            if (existingRow) {
                                existingRow.areasAsignadas.push({ cod: asignacion.detalle_area.cod, nombre: asignacion.detalle_area.nombre });
                            } else {
                                acc.push({
                                    id: asignacion.detalle_usuario.cuil, cuil: asignacion.detalle_usuario.cuil,
                                    areasAsignadas: [{ cod: asignacion.detalle_area.cod, nombre: asignacion.detalle_area.nombre }],
                                    asignarNueva: ''
                                });
                            }
                            return acc;
                        }, [])
                    }
                });
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
                setError(error.message || "Error al cargar los datos iniciales.");
            } finally {
                setCargando(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (success) { const timer = setTimeout(() => setSuccess(false), 3000); return () => clearTimeout(timer); }
    }, [success]);

    useEffect(() => {
        if (error) { const timer = setTimeout(() => setError(null), 3000); return () => clearTimeout(timer); }
    }, [error]);

    const handleOpenEditModal = useCallback((row) => {
        setCurrentEditingRow(row);
        setEditedRowData({ ...row });
        setEditModalOpen(true);
    }, []);

    const handleEditModalClose = useCallback(() => {
        setEditModalOpen(false);
        setCurrentEditingRow(null);
        setEditedRowData({});
    }, []);

    const handleEditInputChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        setEditedRowData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }, []);

    const handleSaveChanges = async () => {
        if (!currentEditingRow || !editedRowData) return;
        const propiedadConfig = convertirAPropiedadConfig(selectOption);
        try {
            setCargando(true);
            const datosParaEnviar = { ...editedRowData };
            if (propiedadConfig === 'cursos') {
                datosParaEnviar.codPlataformaDictado = plataformasDictadoDataState.find(p => p.nombre === editedRowData.plataformaDictado)?.cod;
                datosParaEnviar.codMedioInscripcion = mediosInscripcionDataState.find(m => m.nombre === editedRowData.medioInscripcion)?.cod;
                datosParaEnviar.codTipoCapacitacion = tiposCapacitacionesDataState.find(t => t.nombre === editedRowData.tipoCapacitacion)?.cod;
                datosParaEnviar.codArea = areasDataState.find(a => a.nombre === editedRowData.area)?.cod;
            } else if (propiedadConfig === 'tutores' || propiedadConfig === 'usuarios') {
                datosParaEnviar.codArea = areasDataState.find(a => a.nombre === editedRowData.area)?.cod;
                if (propiedadConfig === 'usuarios') {
                    datosParaEnviar.codRol = rolesDataState.find(r => r.nombre === editedRowData.rol)?.cod;
                }
            }
            if (datosParaEnviar.hasOwnProperty('esVigente')) datosParaEnviar.esVigente = editedRowData.esVigente === "Si";
            if (datosParaEnviar.hasOwnProperty('tiene_evento_creado')) datosParaEnviar.tiene_evento_creado = editedRowData.tiene_evento_creado === "Si";
            if (datosParaEnviar.hasOwnProperty('esReferente')) datosParaEnviar.esReferente = editedRowData.esReferente === "Si";
            if (datosParaEnviar.hasOwnProperty('esExcepcionParaFechas')) datosParaEnviar.esExcepcionParaFechas = editedRowData.esExcepcionParaFechas === "Si";
            if (datosParaEnviar.hasOwnProperty('ministerio')) datosParaEnviar.codMinisterio = ministeriosDataState.find(m => m.nombre === editedRowData.ministerio)?.cod;
            if (currentEditingRow.cod && !datosParaEnviar.cod) datosParaEnviar.cod = currentEditingRow.cod;
            if (currentEditingRow.cuil && !datosParaEnviar.cuil) datosParaEnviar.cuil = currentEditingRow.cuil;

            await updateRow(datosParaEnviar, selectOption);
            updateRowDeConfiguraciones(propiedadConfig, currentEditingRow.id, editedRowData);
            setSuccess("Registro actualizado correctamente.");
            setError(null);
            handleEditModalClose();
        } catch (err) {
            console.error("Error al guardar cambios:", err);
            setError(err.response?.data?.message || err.message || "Error al guardar los cambios.");
            setSuccess(false);
        } finally {
            setCargando(false);
        }
    };

    const handleOpenConfirmDeleteModal = useCallback((row) => {
        setRowToDelete(row);
        setConfirmDeleteModalOpen(true);
    }, []);

    const handleCloseConfirmDeleteModal = useCallback(() => {
        setConfirmDeleteModalOpen(false);
        setRowToDelete(null);
    }, []);

    const handleConfirmDelete = async () => {
        if (!rowToDelete) return;
        const propiedadConfig = convertirAPropiedadConfig(selectOption);
        try {
            setCargando(true);
            await deleteRow(rowToDelete.id, selectOption);
            deleteRowDeConfiguraciones(propiedadConfig, rowToDelete.id);
            setSuccess("Registro eliminado correctamente.");
            setError(null);
        } catch (error) {
            console.error("Error al borrar:", error);
            setError(error.response?.data?.message || error.message || "Error al eliminar el registro.");
            setSuccess(false);
        } finally {
            setCargando(false);
            handleCloseConfirmDeleteModal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const actionColumn = {
        field: 'Accion', headerName: 'Acciones', width: 120, sortable: false, filterable: false, disableColumnMenu: true,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, width: '100%' }}>
                <Tooltip title="Editar" placement="top">
                    <BotonCircular onClick={() => handleOpenEditModal(params.row)} icon="editar" height={30} width={30} />
                </Tooltip>
                <Tooltip title="Borrar" placement="top">
                    <BotonCircular onClick={() => handleOpenConfirmDeleteModal(params.row)} icon="borrar" height={30} width={30} />
                </Tooltip>
            </Box>
        ),
    };

    const deleteRowDeConfiguraciones = (propiedad, id) => {
        setConfiguraciones((prev) => {
            if (!prev[propiedad]) return prev;
            return { ...prev, [propiedad]: { ...prev[propiedad], rows: prev[propiedad].rows.filter(row => row.id !== id) } };
        });
    };

    const updateRowDeConfiguraciones = (propiedad, originalId, newData) => {
        setConfiguraciones((prev) => {
            if (!prev[propiedad]) return prev;
            return {
                ...prev, [propiedad]: {
                    ...prev[propiedad], rows: prev[propiedad].rows.map(row =>
                        row.id === originalId ? { ...row, ...newData, id: newData.cod || newData.cuil || newData.id || originalId } : row
                    )
                }
            };
        });
    };

    const handleSelectOption = (value) => { setSelectOption(value || ""); setFiltroGeneralInput(""); };

    const handleDescargarExcel = async () => {
        const propiedad = convertirAPropiedadConfig(selectOption);
        if (configuraciones[propiedad]?.rows.length > 0) {
            const filasParaExportar = aplicarFiltroGeneral(configuraciones[propiedad].rows, configuraciones[propiedad].columns);
            if (filasParaExportar.length > 0) {
                await descargarExcel(filasParaExportar, configuraciones[propiedad].columns, `Reporte_${selectOption.replace(/\s/g, '_')}`);
            } else { setError("No hay datos que coincidan con el filtro actual para exportar."); }
        } else { setError("No hay datos para exportar en la selección actual."); }
    };

    const handleAgregar = async () => {
        switch (selectOption) {
            case 'Cursos': navigate('/cursos/alta'); break;
            case "Ministerios": navigate('/ministerios/alta'); break;
            case "Áreas": navigate("/areas/alta"); break;
            case "Personas": navigate('/personas/alta'); break;
            case "Tutores": navigate('/tutores/alta'); break;
            case "Medios de Inscripción": navigate('/mediosInscripciones/alta'); break;
            case "Plataformas de Dictado": navigate('/plataformasDictados/alta'); break;
            case "Usuarios": navigate("/usuarios/alta"); break;
            case "Tipos de Capacitación": navigate('/tiposCapacitaciones/alta'); break;
            case "Asignar areas a usuarios": navigate('/areasAsignadasUsuario/alta'); break;
            default: break;
        }
    };

    const handleDeleteAreaAsignada = (cuil, codArea) => {
        setPendingDelete({ cuil, codArea });
        setOpenConfirmDialog(true);
    };

    const confirmDeleteArea = async () => {
        if (!pendingDelete) return;
        try {
            setCargando(true);
            await deleteAreaAsignada(pendingDelete.cuil, pendingDelete.codArea);
            const areasAsignadasRes = await getAreasAsignadas();
            setConfiguraciones(prev => {
                const newConfig = { ...prev };
                newConfig.areasAsignadas.rows = areasAsignadasRes.reduce((acc, asignacion) => {
                    if (!asignacion.detalle_usuario || !asignacion.detalle_area) return acc;
                    const existingRow = acc.find(row => row.cuil === asignacion.detalle_usuario.cuil);
                    if (existingRow) {
                        existingRow.areasAsignadas.push({ cod: asignacion.detalle_area.cod, nombre: asignacion.detalle_area.nombre });
                    } else {
                        acc.push({
                            id: asignacion.detalle_usuario.cuil,
                            cuil: asignacion.detalle_usuario.cuil,
                            areasAsignadas: [{ cod: asignacion.detalle_area.cod, nombre: asignacion.detalle_area.nombre }],
                            asignarNueva: ''
                        });
                    }
                    return acc;
                }, []);
                return newConfig;
            });
            setSuccess("Área desasignada."); setError(null);
        } catch (err) {
            setError(err.message || 'Error al desasignar.'); setSuccess(false);
        } finally {
            setCargando(false);
            setOpenConfirmDialog(false);
            setPendingDelete(null);
        }
    };

    const cancelDeleteArea = () => {
        setOpenConfirmDialog(false);
        setPendingDelete(null);
    };

    const handleAsignarNuevaArea = async (cuil) => {
        setSelectedUserCuil(cuil);
        try {
            setCargando(true);
            const areasRes = await getAreas();
            setAreasDataState(areasRes);
            setAreasDisponibles(areasRes.filter(a => a.esVigente));
            setAreaFilterDialog(''); setOpenDialog(true);
        } catch (err) {
            setError(err.message || "Error al cargar áreas."); }
        finally { setCargando(false); }
    };

    const handleAsignarArea = async (codArea) => {
        if (!selectedUserCuil || !codArea) return;
        try {
            setCargando(true);
            await postAreaAsignada({ cuil_usuario: selectedUserCuil, cod_area: codArea });
            const areasAsignadasRes = await getAreasAsignadas();
            setConfiguraciones(prev => {
                const newConfig = { ...prev };
                newConfig.areasAsignadas.rows = areasAsignadasRes.reduce((acc, asignacion) => {
                    if (!asignacion.detalle_usuario || !asignacion.detalle_area) return acc;
                    const existingRow = acc.find(row => row.cuil === asignacion.detalle_usuario.cuil);
                    if (existingRow) {
                        existingRow.areasAsignadas.push({ cod: asignacion.detalle_area.cod, nombre: asignacion.detalle_area.nombre });
                    } else {
                        acc.push({
                            id: asignacion.detalle_usuario.cuil,
                            cuil: asignacion.detalle_usuario.cuil,
                            areasAsignadas: [{ cod: asignacion.detalle_area.cod, nombre: asignacion.detalle_area.nombre }],
                            asignarNueva: ''
                        });
                    }
                    return acc;
                }, []);
                return newConfig;
            });
            setSuccess("Área asignada."); setError(null);
        } catch (err) {
            setError(err.message || "Error al asignar."); setSuccess(false);
        } finally {
            setCargando(false);
        }
    };

    const handleCloseDialog = () => { setOpenDialog(false); setSelectedUserCuil(null); setAreaFilterDialog(''); };

    const aplicarFiltroGeneral = (rowsOriginales, columnasVisibles) => {
        if (!filtroGeneralInput.trim()) return rowsOriginales;
        const filtro = filtroGeneralInput.toLowerCase().trim();
        return rowsOriginales.filter(row =>
            columnasVisibles.some(col => {
                if (col.field === 'Accion' || col.field === 'asignarNueva') return false;
                const val = row[col.field];
                if (val != null) {
                    if (Array.isArray(val) && col.field === 'areasAsignadas') return val.some(a => a.nombre.toLowerCase().includes(filtro));
                    return String(val).toLowerCase().includes(filtro);
                }
                return false;
            })
        );
    };

    const propiedadConfigSeleccionada = convertirAPropiedadConfig(selectOption);
    const configuracionActual = configuraciones[propiedadConfigSeleccionada];
    const columnasActuales = configuracionActual?.columns || [];
    const filasOriginales = configuracionActual?.rows || [];
    const filasFiltradas = aplicarFiltroGeneral(filasOriginales, columnasActuales);

    return (
        <>
            {error && <Alert variant="filled" severity="error" sx={{ width: '100%', mb: 2, position: 'sticky', top: 0, zIndex: 1200 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert variant="filled" severity="success" sx={{ width: '100%', mb: 2, position: 'sticky', top: 0, zIndex: 1200 }} onClose={() => setSuccess(false)}>{typeof success === 'string' ? success : "Operación exitosa"}</Alert>}
            {cargando && <Backdrop sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 10 }} open={cargando}><CircularProgress color="inherit" /></Backdrop>}

            <Box
                ref={containerRef}
                sx={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '20px',
                    display: 'grid',
                    gap: '20px',
                    gridTemplateColumns: '1fr',
                    gridTemplateAreas: `
                        "titulo"
                        "divider"
                        "controles"
                        "tabla"
                    `
                }}>
                <div style={{ gridArea: 'titulo' }}>
                    <Titulo texto="Alta, Baja y Modificación" />
                </div>

                <div style={{ gridArea: 'divider' }}>
                    <Divider sx={{ mb: 2, borderBottomWidth: 2, borderColor: 'black', mt: 2 }} />
                </div>

                <div style={{ gridArea: 'controles' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Autocomplete options={options} label="Seleccione una Opción" value={selectOption} getValue={handleSelectOption} sx={{ minWidth: 300, flexGrow: 1 }} />
                        {selectOption && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Descargar Excel" placement="top">
                                    <span>
                                        <BotonCircular onClick={handleDescargarExcel} icon="descargar" height={40} width={40} disabled={filasFiltradas.length === 0} />
                                    </span>
                                </Tooltip>
                                <Tooltip title="Agregar Nuevo" placement="top">
                                    <BotonCircular onClick={handleAgregar} icon="agregar" height={40} width={40} />
                                </Tooltip>
                            </Box>
                        )}
                    </Box>

                    {!selectOption && !cargando && <Alert severity="info" sx={{ mt: 2, mb: 2 }}>Seleccione una opción para cargar los datos.</Alert>}

                    {selectOption && (
                        <MuiTextField fullWidth variant="outlined" label={`Filtrar en ${selectOption}...`} value={filtroGeneralInput} onChange={(e) => setFiltroGeneralInput(e.target.value)}
                            sx={{ mb: 2, mt: 1 }} InputProps={{
                                endAdornment: filtroGeneralInput && (<IconButton onClick={() => setFiltroGeneralInput('')} edge="end" size="small"><CloseIcon /></IconButton>)
                            }} />
                    )}
                </div>

                <div style={{ gridArea: 'tabla', overflow: 'hidden' }}> {/* <-- CAMBIO CLAVE: overflow: hidden */}
                    {selectOption && configuracionActual && !cargando && (
                        <Box sx={{ height: 600, width: '100%' }}>
                            <DataGrid
                                columns={selectOption !== "Asignar areas a usuarios" ? [...columnasActuales, actionColumn] : columnasActuales}
                                rows={filasFiltradas}
                                pageSizeOptions={[10, 25, 50, 100]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                density="compact"
                                getRowId={(row) => row.id || row.cod || row.cuil}
                            />
                        </Box>
                    )}
                    {selectOption && !configuracionActual && !cargando && <Alert severity="warning" sx={{ mt: 2 }}>No hay configuración para "{selectOption}".</Alert>}
                    {selectOption && configuracionActual && filasFiltradas.length === 0 && filtroGeneralInput && !cargando && <Alert severity="info" sx={{ mt: 2 }}>No se encontraron resultados para "{filtroGeneralInput}" en {selectOption}.</Alert>}
                    {selectOption && configuracionActual && filasOriginales.length === 0 && !filtroGeneralInput && !cargando && <Alert severity="info" sx={{ mt: 2 }}>No hay datos disponibles para {selectOption}.</Alert>}
                </div>
            </Box>

            {/* MODALES (sin cambios) */}
            {editModalOpen && currentEditingRow && configuracionActual && (
                <Dialog open={editModalOpen} onClose={handleEditModalClose} maxWidth="md" fullWidth>
                    <DialogTitle>
                        Editar {selectOption.slice(0, -1)}: {currentEditingRow.nombre || currentEditingRow.cuil || currentEditingRow.cod}
                        <IconButton aria-label="close" onClick={handleEditModalClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box component="form" noValidate autoComplete="off" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2, p: 1 }}>
                            {columnasActuales.filter(col => col.editable).map(col => {
                                const commonProps = {
                                    key: col.field, name: col.field, label: col.headerName,
                                    value: editedRowData[col.field] || '', onChange: handleEditInputChange,
                                    fullWidth: true, variant: "outlined", margin: "dense",
                                    disabled: col.editable === false || (col.field === 'cod' && selectOption !== 'Personas') || (col.field === 'cuil' && selectOption !== 'Personas'),
                                };
                                if (col.type === 'booleanSelect' && col.options) {
                                    return (
                                        <FormControl {...commonProps} variant="outlined">
                                            <InputLabel>{col.headerName}</InputLabel>
                                            <MuiSelect name={col.field} value={editedRowData[col.field] || ''} label={col.headerName} onChange={handleEditInputChange}>
                                                {col.options.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                            </MuiSelect>
                                        </FormControl>
                                    );
                                } else if (col.type === 'select' && col.options) {
                                    return (
                                        <FormControl {...commonProps} variant="outlined">
                                            <InputLabel>{col.headerName}</InputLabel>
                                            <MuiSelect name={col.field} value={editedRowData[col.field] || ''} label={col.headerName} onChange={handleEditInputChange}>
                                                {col.options.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                            </MuiSelect>
                                        </FormControl>
                                    );
                                } else {
                                    return <MuiTextField {...commonProps} type={col.type === 'number' ? 'number' : 'text'} />;
                                }
                            })}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <MuiButton onClick={handleEditModalClose} color="secondary">Cancelar</MuiButton>
                        <MuiButton onClick={handleSaveChanges} variant="contained" color="primary" disabled={cargando}>
                            {cargando ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
                        </MuiButton>
                    </DialogActions>
                </Dialog>
            )}

            {confirmDeleteModalOpen && rowToDelete && (
                <Dialog open={confirmDeleteModalOpen} onClose={handleCloseConfirmDeleteModal} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ backgroundColor: 'error.main', color: 'white' }}>Confirmar Eliminación</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ pt: 2 }}>
                            ¿Está seguro de que desea eliminar el registro: <strong>{rowToDelete.nombre || rowToDelete.cuil || rowToDelete.cod || rowToDelete.id}</strong>?
                            <br />Esta acción no se puede deshacer.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <MuiButton onClick={handleCloseConfirmDeleteModal} color="secondary">Cancelar</MuiButton>
                        <MuiButton onClick={handleConfirmDelete} variant="contained" color="error" startIcon={<DeleteIcon />} disabled={cargando}>
                            {cargando ? <CircularProgress size={24} color="inherit" /> : "Eliminar"}
                        </MuiButton>
                    </DialogActions>
                </Dialog>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Asignar Áreas a {selectedUserCuil}
                    <IconButton aria-label="close" onClick={handleCloseDialog} size="small"><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    {cargando ? (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}><CircularProgress /></Box>
                    ) : (
                        <>
                            <MuiTextField fullWidth variant="outlined" label="Filtrar áreas disponibles" value={areaFilterDialog} onChange={(e) => setAreaFilterDialog(e.target.value)}
                                sx={{ mb: 2, mt: 1 }} InputProps={{
                                    endAdornment: areaFilterDialog && (<IconButton onClick={() => setAreaFilterDialog('')} edge="end" size="small"><CloseIcon /></IconButton>)
                                }} />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: '300px', overflowY: 'auto', p: 0.5 }}>
                                {areasDisponibles
                                    .filter(area => {
                                        const cfgAreasAsig = configuraciones.areasAsignadas;
                                        let yaAsig = cfgAreasAsig?.rows.find(r => r.cuil === selectedUserCuil)?.areasAsignadas.some(a => a.cod === area.cod) || false;
                                        const filtro = areaFilterDialog.toLowerCase();
                                        const coincide = area.nombre.toLowerCase().includes(filtro) || (area.detalle_ministerio?.nombre || '').toLowerCase().includes(filtro);
                                        return !yaAsig && coincide;
                                    })
                                    .map(area => (
                                        <Chip key={area.cod} label={`${area.nombre} (${area.detalle_ministerio?.nombre || 'Sin Min.'})`} onClick={() => handleAsignarArea(area.cod)}
                                            color="primary" variant="outlined" sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'primary.lighter', borderColor: 'primary.main' } }} />
                                    ))}
                                {areasDisponibles.filter(area => {
                                    const cfgAreasAsig = configuraciones.areasAsignadas;
                                    let yaAsig = cfgAreasAsig?.rows.find(r => r.cuil === selectedUserCuil)?.areasAsignadas.some(a => a.cod === area.cod) || false;
                                    const filtro = areaFilterDialog.toLowerCase();
                                    const coincide = area.nombre.toLowerCase().includes(filtro) || (area.detalle_ministerio?.nombre || '').toLowerCase().includes(filtro);
                                    return !yaAsig && coincide;
                                }).length === 0 && (
                                        <Typography variant="body2" sx={{ p: 1, color: 'text.secondary', width: '100%', textAlign: 'center' }}>
                                            {areaFilterDialog ? `No se encontraron áreas disponibles para "${areaFilterDialog}".` : "No hay más áreas disponibles para asignar o todas coinciden con el filtro."}
                                        </Typography>
                                    )}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions><MuiButton onClick={handleCloseDialog}>Cerrar</MuiButton></DialogActions>
            </Dialog>

            <Dialog open={openConfirmDialog} onClose={cancelDeleteArea}>
                <Alert severity="warning" sx={{ m: 2 }}>
                    ¿Está seguro que desea desasignar el área?
                </Alert>
                <DialogActions>
                    <MuiButton onClick={cancelDeleteArea} color="secondary">Cancelar</MuiButton>
                    <MuiButton onClick={confirmDeleteArea} color="error" variant="contained">Desasignar</MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AltaBajaModificion;