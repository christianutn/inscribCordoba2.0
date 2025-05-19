import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
import { useState, useEffect, useCallback } from "react"; // Añadido useCallback
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
// SelectEditInputCell ya no se usaría si la edición es solo modal
// import SelectEditInputCell from "./UIElements/SelectEditInputCell.jsx";
import { DataGrid } from "@mui/x-data-grid";
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Box from '@mui/material/Box';
import { Divider, FormControl, InputLabel, MenuItem, Select as MuiSelect, Button as MuiButton } from '@mui/material'; // Añadidos para el modal
import Alert from '@mui/material/Alert';
import { descargarExcel } from "../services/excel.service.js";
import { useNavigate } from "react-router-dom";
import { getAreasAsignadas, deleteAreaAsignada, postAreaAsignada } from "../services/areasAsignadasUsuario.service";
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions'; // Añadido
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import MuiTextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Typography from '@mui/material/Typography';


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

    // Use state
    const [selectOption, setSelectOption] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [configuraciones, setConfiguraciones] = useState({});

    // Estados para los datos de cada entidad (usados para las opciones de los Selects en el modal)
    const [ministeriosDataState, setMinisteriosDataState] = useState([]);
    const [areasDataState, setAreasDataState] = useState([]);
    // const [personasDataState, setPersonasDataState] = useState([]); // No se usa para selects de edición
    // const [tutoresDataState, setTutoresDataState] = useState([]); // No se usa para selects de edición
    const [tiposCapacitacionesDataState, setTiposCapacitacionesDataState] = useState([]);
    const [mediosInscripcionDataState, setMediosInscripcionDataState] = useState([]);
    const [plataformasDictadoDataState, setPlataformasDictadoDataState] = useState([]);
    const [rolesDataState, setRolesDataState] = useState([]);
    // const [usuariosDataState, setUsuariosDataState] = useState([]); // No se usa para selects de edición
    // const [cursosDataState, setCursosDataState] = useState([]); // No se usa para selects de edición


    // Estados para el diálogo de asignar áreas
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUserCuil, setSelectedUserCuil] = useState(null);
    const [areaFilterDialog, setAreaFilterDialog] = useState('');
    const [areasDisponibles, setAreasDisponibles] = useState([]);

    const [filtroGeneralInput, setFiltroGeneralInput] = useState("");

    // Estados para el Modal de Edición General
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentEditingRow, setCurrentEditingRow] = useState(null); // Fila original antes de editar
    const [editedRowData, setEditedRowData] = useState({}); // Datos modificados en el formulario del modal

    useEffect(() => {
        setCargando(true);
        (async () => {
            try {
                const [
                    cursosRes,
                    ministeriosRes,
                    areasRes,
                    personasRes,
                    tutoresRes,
                    tiposCapacitacionesRes,
                    mediosInscripcionRes,
                    plataformasDictadoRes,
                    usuariosRes,
                    rolesRes,
                    areasAsignadasRes
                ] = await Promise.all([
                    getCursos(),
                    getMinisterios(),
                    getAreas(),
                    getPersonas(),
                    getTutores(),
                    getTiposCapacitacion(),
                    getMediosInscripcion(),
                    getPlataformasDictado(),
                    getUsuarios(),
                    getRoles(),
                    getAreasAsignadas()
                ]);

                // Guardar datos para opciones de Selects en el modal de edición
                setMinisteriosDataState(ministeriosRes);
                setAreasDataState(areasRes);
                setTiposCapacitacionesDataState(tiposCapacitacionesRes);
                setMediosInscripcionDataState(mediosInscripcionRes);
                setPlataformasDictadoDataState(plataformasDictadoRes);
                setRolesDataState(rolesRes);

                setConfiguraciones({
                    cursos: {
                        // Quitar 'editable: true' de las columnas si la edición es solo modal
                        columns: [
                            { field: 'cod', headerName: 'Código', width: 120 },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true }, // 'editable' aquí define si aparece en el modal
                            { field: 'cupo', headerName: 'Cupo', width: 100, type: 'number', editable: true },
                            {
                                field: 'plataformaDictado', headerName: 'Pataforma de dictado', width: 180, editable: true,
                                type: 'select', // Tipo para el modal
                                options: plataformasDictadoRes.map(e => ({ value: e.nombre, label: e.nombre })), // Opciones para el modal
                            },
                            {
                                field: 'medioInscripcion', headerName: 'Medio de inscripción', width: 180, editable: true,
                                type: 'select',
                                options: mediosInscripcionRes.map(e => ({ value: e.nombre, label: e.nombre })),
                            },
                            {
                                field: 'tipoCapacitacion', headerName: 'Tipo de capacitación', width: 180, editable: true,
                                type: 'select',
                                options: tiposCapacitacionesRes.map(e => ({ value: e.nombre, label: e.nombre })),
                            },
                            { field: 'horas', headerName: 'Horas', width: 100, type: 'number', editable: true },
                            { field: 'area', headerName: 'Area', width: 180 }, // No editable directamente, es un detalle
                            { field: 'ministerio', headerName: 'Ministerio', width: 180 }, // No editable, detalle
                            {
                                field: 'esVigente', headerName: '¿Está vigente?', width: 130, editable: true,
                                type: 'booleanSelect', // Tipo para el modal
                                options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            },
                            {
                                field: 'tiene_evento_creado', headerName: '¿Tiene evento creado?', width: 180, editable: true,
                                type: 'booleanSelect',
                                options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
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
                            { field: 'cod', headerName: 'Código', flex: 1, editable: false }, // Código usualmente no se edita
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
                            { field: 'ministerio', headerName: 'Ministerio', flex: 1 }, // Detalle, no editable aquí
                            {
                                field: 'esVigente', headerName: '¿Está vigente?', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: areasRes.map((e) => ({ id: e.cod, cod: e.cod, nombre: e.nombre, ministerio: e.detalle_ministerio?.nombre || 'N/A', esVigente: e.esVigente ? "Si" : "No" }))
                    },
                    personas: {
                        columns: [ // Todos editables para personas
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
                            { field: 'cuil', headerName: 'CUIL', width: 150, editable: false }, // CUIL de tutor no se edita, se edita la persona
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
                    // ... (Repetir patrón para Medios de Inscripción, Plataformas, Tipos de Capacitación)
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
                    areasAsignadas: { // Esta sección no tiene edición de fila, solo asignación/desasignación
                        columns: [ /* ... sin cambios ... */
                            { field: 'cuil', headerName: 'CUIL', width: 150 },
                            {
                                field: 'areasAsignadas',
                                headerName: 'Áreas asignadas',
                                flex: 1,
                                sortable: false,
                                filterable: false,
                                renderCell: (params) => (
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', p: 0.5, maxHeight: '100px', overflowY: 'auto' }}>
                                        {params.value.map((area) => (
                                            <Tooltip
                                                key={area.cod}
                                                title={area.nombre}
                                                placement="top"
                                                arrow
                                            >
                                                <Chip
                                                    label={area.nombre}
                                                    onDelete={() => handleDeleteAreaAsignada(params.row.cuil, area.cod)}
                                                    size="small"
                                                    sx={{
                                                        '& .MuiChip-label': {
                                                            maxWidth: '120px',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                )
                            },
                            {
                                field: 'asignarNueva',
                                headerName: 'Asignar',
                                width: 100,
                                align: 'center',
                                headerAlign: 'center',
                                sortable: false,
                                filterable: false,
                                renderCell: (params) => (
                                    <Tooltip title="Asignar nueva área" placement="top">
                                        <IconButton
                                            onClick={() => handleAsignarNuevaArea(params.row.cuil)}
                                            color="primary"
                                            size="small"
                                        >
                                            <AddCircleIcon />
                                        </IconButton>
                                    </Tooltip>
                                )
                            }
                        ],
                        rows: areasAsignadasRes.reduce((acc, asignacion) => {
                            if (!asignacion.detalle_usuario || !asignacion.detalle_area) {
                                console.warn("Asignación incompleta omitida:", asignacion);
                                return acc;
                            }
                            const existingRow = acc.find(row => row.cuil === asignacion.detalle_usuario.cuil);
                            if (existingRow) {
                                existingRow.areasAsignadas.push({
                                    cod: asignacion.detalle_area.cod,
                                    nombre: asignacion.detalle_area.nombre
                                });
                                return acc;
                            }
                            return [...acc, {
                                id: asignacion.detalle_usuario.cuil,
                                cuil: asignacion.detalle_usuario.cuil,
                                areasAsignadas: [{
                                    cod: asignacion.detalle_area.cod,
                                    nombre: asignacion.detalle_area.nombre
                                }],
                                asignarNueva: ''
                            }];
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
    }, []); // Solo se ejecuta al montar

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleOpenEditModal = useCallback((row) => {
        setCurrentEditingRow(row);
        setEditedRowData({ ...row }); // Copiar la fila para edición
        setEditModalOpen(true);
    }, []);

    const handleEditModalClose = useCallback(() => {
        setEditModalOpen(false);
        setCurrentEditingRow(null);
        setEditedRowData({});
    }, []);

    const handleEditInputChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        setEditedRowData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const handleSaveChanges = async () => {
        if (!currentEditingRow || !editedRowData) return;
        const propiedadConfig = convertirAPropiedadConfig(selectOption);

        try {
            setCargando(true);
            const datosParaEnviar = { ...editedRowData }; // Usar los datos del formulario del modal

            // Mapeos y conversiones (similar a la lógica anterior de handleActionClick('editar'))
            // Esto dependerá de la estructura exacta que espera tu API
            // y de los nombres de los campos en `editedRowData`
            if (propiedadConfig === 'cursos') {
                datosParaEnviar.codPlataformaDictado = plataformasDictadoDataState.find(p => p.nombre === editedRowData.plataformaDictado)?.cod;
                datosParaEnviar.codMedioInscripcion = mediosInscripcionDataState.find(m => m.nombre === editedRowData.medioInscripcion)?.cod;
                datosParaEnviar.codTipoCapacitacion = tiposCapacitacionesDataState.find(t => t.nombre === editedRowData.tipoCapacitacion)?.cod;
            } else if (propiedadConfig === 'tutores' || propiedadConfig === 'usuarios') {
                datosParaEnviar.codArea = areasDataState.find(a => a.nombre === editedRowData.area)?.cod;
                if (propiedadConfig === 'usuarios') {
                    datosParaEnviar.codRol = rolesDataState.find(r => r.nombre === editedRowData.rol)?.cod;
                }
            }

            if (datosParaEnviar.hasOwnProperty('esVigente')) {
                datosParaEnviar.esVigente = editedRowData.esVigente === "Si";
            }
            if (datosParaEnviar.hasOwnProperty('tiene_evento_creado')) {
                datosParaEnviar.tiene_evento_creado = editedRowData.tiene_evento_creado === "Si";
            }
            if (datosParaEnviar.hasOwnProperty('esReferente')) {
                datosParaEnviar.esReferente = editedRowData.esReferente === "Si";
            }
            if (datosParaEnviar.hasOwnProperty('esExcepcionParaFechas')) {
                datosParaEnviar.esExcepcionParaFechas = editedRowData.esExcepcionParaFechas === "Si";
            }
            // Asegurar que el ID/PK correcto se envíe (ej. 'cod' o 'cuil' en lugar de 'id' si es necesario)
            if (currentEditingRow.cod && !datosParaEnviar.cod) datosParaEnviar.cod = currentEditingRow.cod;
            if (currentEditingRow.cuil && !datosParaEnviar.cuil) datosParaEnviar.cuil = currentEditingRow.cuil;


            await updateRow(datosParaEnviar, selectOption);
            updateRowDeConfiguraciones(propiedadConfig, currentEditingRow.id, editedRowData); // Actualizar UI
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


    const actionColumn = {
        field: 'Accion',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, width: '100%' }}>
                <Tooltip title="Editar" placement="top">
                    <IconButton onClick={() => handleOpenEditModal(params.row)} size="small">
                        <BotonCircular icon="editar" height={30} width={30} isIconButton />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Borrar" placement="top">
                    <IconButton onClick={() => handleActionClick('borrar', params.row)} size="small"> {/* Pasar params.row */}
                        <BotonCircular icon="borrar" height={30} width={30} isIconButton />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    };

    const handleActionClick = async (action, rowData) => { // Modificado para recibir rowData directamente
        const propiedadConfig = convertirAPropiedadConfig(selectOption);

        if (action === 'borrar') {
            if (window.confirm(`¿Está seguro de que desea eliminar el registro con ID ${rowData.id}?`)) {
                try {
                    setCargando(true);
                    // `deleteRow` probablemente espera el ID (cod, cuil), no el `id` de DataGrid si son diferentes.
                    // Ajustar según tu servicio `deleteRow`.
                    await deleteRow(rowData.id, selectOption); // Asumiendo que rowData.id es el PK
                    deleteRowDeConfiguraciones(propiedadConfig, rowData.id);
                    setSuccess("Registro eliminado correctamente.");
                    setError(null);
                } catch (error) {
                    console.error("Error al borrar:", error);
                    setError(error.response?.data?.message || error.message || "Error al eliminar el registro.");
                    setSuccess(false);
                } finally {
                    setCargando(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }
        // La lógica de 'editar' se movió a handleSaveChanges
    };


    // --- Resto de las funciones (deleteRowDeConfiguraciones, updateRowDeConfiguraciones, handleSelectOption, etc.) ---
    // ... (sin cambios significativos, excepto que `updateRowDeConfiguraciones` ahora toma `editedRowData`)
    const deleteRowDeConfiguraciones = (propiedad, id) => {
        setConfiguraciones((prevConfiguraciones) => {
            if (!prevConfiguraciones[propiedad]) return prevConfiguraciones;
            const updatedRows = prevConfiguraciones[propiedad].rows.filter((row) => row.id !== id);
            return {
                ...prevConfiguraciones,
                [propiedad]: {
                    ...prevConfiguraciones[propiedad],
                    rows: updatedRows
                }
            };
        });
    };

    const updateRowDeConfiguraciones = (propiedad, originalId, newData) => { // originalId es el id de la fila antes de cualquier cambio de PK
        setConfiguraciones((prevConfiguraciones) => {
            if (!prevConfiguraciones[propiedad]) return prevConfiguraciones;
            const updatedRows = prevConfiguraciones[propiedad].rows.map((row) => {
                if (row.id === originalId) {
                    // El nuevo ID podría ser diferente si el PK (cod, cuil) se edita
                    const newId = newData.cod || newData.cuil || newData.id || originalId;
                    return { ...row, ...newData, id: newId };
                }
                return row;
            });
            return {
                ...prevConfiguraciones,
                [propiedad]: {
                    ...prevConfiguraciones[propiedad],
                    rows: updatedRows
                }
            };
        });
    };


    const handleSelectOption = (value) => {
        setSelectOption(value || "");
        setFiltroGeneralInput("");
    };

    const handleDescargarExcel = async () => {
        const propiedad = convertirAPropiedadConfig(selectOption);
        if (configuraciones[propiedad] && configuraciones[propiedad].rows.length > 0) {
            const filasParaExportar = aplicarFiltroGeneral(configuraciones[propiedad].rows, configuraciones[propiedad].columns);
            if (filasParaExportar.length > 0) {
                await descargarExcel(filasParaExportar, configuraciones[propiedad].columns, `Reporte_${selectOption.replace(/\s/g, '_')}`);
            } else {
                setError("No hay datos que coincidan con el filtro actual para exportar.");
            }
        } else {
            setError("No hay datos para exportar en la selección actual.");
        }
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
            case "Asignar areas a usuarios":
                setError("La opción 'Asignar áreas a usuarios' no tiene una pantalla de 'alta' directa. Gestione desde la tabla.");
                break;
            default: break;
        }
    };

    const handleDeleteAreaAsignada = async (cuil, codArea) => {
        if (window.confirm(`¿Está seguro de que desea desasignar el área al usuario ${cuil}?`)) {
            try {
                setCargando(true);
                await deleteAreaAsignada(cuil, codArea);
                setConfiguraciones(prevConfig => {
                    const newConfig = JSON.parse(JSON.stringify(prevConfig));
                    const areasAsignadasConfig = newConfig.areasAsignadas;
                    if (!areasAsignadasConfig) return prevConfig;
                    const userRowIndex = areasAsignadasConfig.rows.findIndex(row => row.cuil === cuil);
                    if (userRowIndex > -1) {
                        areasAsignadasConfig.rows[userRowIndex].areasAsignadas =
                            areasAsignadasConfig.rows[userRowIndex].areasAsignadas.filter(
                                area => area.cod !== codArea
                            );
                    }
                    return newConfig;
                });
                setSuccess("Área desasignada correctamente.");
                setError(null);
            } catch (error) {
                setError(error.message || 'Error al eliminar el área asignada');
                setSuccess(false);
            } finally {
                setCargando(false);
            }
        }
    };

    const handleAsignarNuevaArea = async (cuil) => {
        setSelectedUserCuil(cuil);
        try {
            setCargando(true);
            const areasRes = await getAreas(); // Re-obtener
            setAreasDataState(areasRes); // Actualizar estado si es necesario para otros selects
            setAreasDisponibles(areasRes.filter(area => area.esVigente));
            setAreaFilterDialog('');
            setOpenDialog(true);
        } catch (error) {
            setError(error.message || "Error al cargar áreas disponibles.");
        } finally {
            setCargando(false);
        }
    };

    const handleAsignarArea = async (codArea) => {
        // ... (sin cambios funcionales mayores)
        if (!selectedUserCuil || !codArea) return;
        try {
            setCargando(true);
            await postAreaAsignada({ cuil_usuario: selectedUserCuil, cod_area: codArea });
            const areaSeleccionada = areasDataState.find(area => area.cod === codArea); // Usar areasDataState
            if (!areaSeleccionada) throw new Error("Área seleccionada no encontrada.");
            setConfiguraciones(prevConfig => {
                const newConfig = JSON.parse(JSON.stringify(prevConfig));
                const areasAsignadasConfig = newConfig.areasAsignadas;
                if (!areasAsignadasConfig) return prevConfig;
                let userRow = areasAsignadasConfig.rows.find(row => row.cuil === selectedUserCuil);
                if (userRow) {
                    if (!userRow.areasAsignadas.find(a => a.cod === areaSeleccionada.cod)) {
                        userRow.areasAsignadas.push({ cod: areaSeleccionada.cod, nombre: areaSeleccionada.nombre });
                        userRow.areasAsignadas.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    }
                } else {
                    areasAsignadasConfig.rows.push({
                        id: selectedUserCuil, cuil: selectedUserCuil,
                        areasAsignadas: [{ cod: areaSeleccionada.cod, nombre: areaSeleccionada.nombre }],
                        asignarNueva: ''
                    });
                    areasAsignadasConfig.rows.sort((a, b) => a.cuil.localeCompare(b.cuil));
                }
                return newConfig;
            });
            setSuccess("Área asignada correctamente.");
            setError(null);
        } catch (error) {
            setError(error.message || "Error al asignar el área.");
            setSuccess(false);
        } finally {
            setCargando(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUserCuil(null);
        setAreaFilterDialog('');
    };

    const aplicarFiltroGeneral = (rowsOriginales, columnasVisibles) => {
        if (!filtroGeneralInput.trim()) {
            return rowsOriginales;
        }
        const filtroMinusculas = filtroGeneralInput.toLowerCase().trim();
        return rowsOriginales.filter(row => {
            return columnasVisibles.some(col => {
                if (col.field === 'Accion' || col.field === 'asignarNueva') return false;
                const valorCelda = row[col.field];
                if (valorCelda !== null && valorCelda !== undefined) {
                    if (Array.isArray(valorCelda) && col.field === 'areasAsignadas') {
                        return valorCelda.some(area => area.nombre.toLowerCase().includes(filtroMinusculas));
                    }
                    return String(valorCelda).toLowerCase().includes(filtroMinusculas);
                }
                return false;
            });
        });
    };

    const propiedadConfigSeleccionada = convertirAPropiedadConfig(selectOption);
    const configuracionActual = configuraciones[propiedadConfigSeleccionada];
    const columnasActuales = configuracionActual?.columns || [];
    const filasOriginales = configuracionActual?.rows || [];
    const filasFiltradas = aplicarFiltroGeneral(filasOriginales, columnasActuales);


    return (
        <>
            {error && ( /* ... Alertas ... */
                <Alert variant="filled" severity="error" sx={{ width: '100%', mb: 2, position: 'sticky', top: 0, zIndex: 1200 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="filled" severity="success" sx={{ width: '100%', mb: 2, position: 'sticky', top: 0, zIndex: 1200 }} onClose={() => setSuccess(false)}>
                    {typeof success === 'string' ? success : "Operación exitosa"}
                </Alert>
            )}
            {cargando && ( /* ... Backdrop ... */
                <Backdrop
                    sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 10 }}
                    open={cargando}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )}

            <div className="container-abm" style={{ padding: '20px' }}>
                {/* ... Titulo, Divider, Autocomplete, Botones ... */}
                <Titulo className="titulo-principal" texto="Alta, Baja y Modificación" />
                <Divider className="divider" sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Autocomplete
                        options={options}
                        label={"Seleccione una Opción"}
                        value={selectOption}
                        getValue={handleSelectOption}
                        sx={{ minWidth: 300, flexGrow: 1 }}
                    />
                    {selectOption && (
                        <Box className="btn" sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Descargar Excel" placement="top">
                                <IconButton onClick={handleDescargarExcel} color="primary" size="large" disabled={filasFiltradas.length === 0}>
                                    <BotonCircular icon="descargar" height={40} width={40} isIconButton />
                                </IconButton>
                            </Tooltip>
                            {selectOption !== "Asignar areas a usuarios" && (
                                <Tooltip title="Agregar Nuevo" placement="top">
                                    <IconButton onClick={handleAgregar} color="primary" size="large">
                                        <BotonCircular icon="agregar" height={40} width={40} isIconButton />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    )}
                </Box>

                {!selectOption && !cargando && (
                    <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                        Seleccione una opción para cargar los datos correspondientes.
                    </Alert>
                )}

                {selectOption && ( /* ... Filtro General TextField ... */
                    <MuiTextField
                        fullWidth
                        variant="outlined"
                        label={`Filtrar en ${selectOption}...`}
                        value={filtroGeneralInput}
                        onChange={(e) => setFiltroGeneralInput(e.target.value)}
                        sx={{ mb: 2, mt: 1 }}
                        InputProps={{
                            endAdornment: filtroGeneralInput && (
                                <IconButton onClick={() => setFiltroGeneralInput('')} edge="end" size="small">
                                    <CloseIcon />
                                </IconButton>
                            )
                        }}
                    />
                )}

                {selectOption && configuracionActual && !cargando && ( /* ... DataGrid ... */
                    <Box sx={{ height: 'calc(100vh - 350px)', minHeight: 400, width: '100%' }}>
                        <DataGrid
                            columns={
                                selectOption !== "Asignar areas a usuarios"
                                    ? [...columnasActuales, actionColumn]
                                    : columnasActuales
                            }
                            rows={filasFiltradas}
                            // Quitar processRowUpdate y onProcessRowUpdateError si la edición es solo modal
                            pageSizeOptions={[10, 25, 50, 100]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            density="compact"
                            getRowId={(row) => row.id || row.cod || row.cuil}
                            // editMode="cell" // Ya no es necesario si las columnas no son editables
                            sx={{
                                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                            }}
                            localeText={{
                                noRowsLabel: 'No hay filas para mostrar',
                                MuiTablePagination: {
                                    labelRowsPerPage: 'Filas por página:',
                                    labelDisplayedRows: ({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`,
                                },
                                toolbarDensity: 'Densidad', toolbarFilters: 'Filtros', toolbarColumns: 'Columnas',
                            }}
                        />
                    </Box>
                )}
                {/* ... Alertas de no configuración / no resultados / no datos ... */}
                {selectOption && !configuracionActual && !cargando && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        No hay configuración definida para "{selectOption}".
                    </Alert>
                )}
                {selectOption && configuracionActual && filasFiltradas.length === 0 && filtroGeneralInput && !cargando && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No se encontraron resultados para "{filtroGeneralInput}" en {selectOption}.
                    </Alert>
                )}
                {selectOption && configuracionActual && filasOriginales.length === 0 && !filtroGeneralInput && !cargando && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No hay datos disponibles para {selectOption}.
                    </Alert>
                )}
            </div>

            {/* Modal de Edición General */}
            {editModalOpen && currentEditingRow && configuracionActual && (
                <Dialog open={editModalOpen} onClose={handleEditModalClose} maxWidth="md" fullWidth>
                    <DialogTitle>
                        Editar {selectOption.slice(0, -1)}: {currentEditingRow.nombre || currentEditingRow.cuil || currentEditingRow.cod}
                        <IconButton aria-label="close" onClick={handleEditModalClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box component="form" noValidate autoComplete="off" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2, p: 1 }}>
                            {columnasActuales.filter(col => col.editable).map(col => {
                                const commonProps = {
                                    key: col.field,
                                    name: col.field,
                                    label: col.headerName,
                                    value: editedRowData[col.field] || '', // Asegurar que el valor no sea undefined para controlled components
                                    onChange: handleEditInputChange,
                                    fullWidth: true,
                                    variant: "outlined",
                                    margin: "dense",
                                    disabled: col.editable === false || (col.field === 'cod' && selectOption !== 'Personas') || (col.field === 'cuil' && selectOption !== 'Personas'), // Deshabilitar 'cod' y 'cuil' excepto para Personas
                                };

                                if (col.type === 'booleanSelect' && col.options) {
                                    return (
                                        <FormControl {...commonProps} variant="outlined">
                                            <InputLabel>{col.headerName}</InputLabel>
                                            <MuiSelect
                                                name={col.field}
                                                value={editedRowData[col.field] || ''}
                                                label={col.headerName}
                                                onChange={handleEditInputChange}
                                            >
                                                {col.options.map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </MuiSelect>
                                        </FormControl>
                                    );
                                } else if (col.type === 'select' && col.options) {
                                    return (
                                        <FormControl {...commonProps} variant="outlined">
                                            <InputLabel>{col.headerName}</InputLabel>
                                            <MuiSelect
                                                name={col.field}
                                                value={editedRowData[col.field] || ''}
                                                label={col.headerName}
                                                onChange={handleEditInputChange}
                                            >
                                                {col.options.map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </MuiSelect>
                                        </FormControl>
                                    );
                                } else {
                                    return (
                                        <MuiTextField
                                            {...commonProps}
                                            type={col.type === 'number' ? 'number' : 'text'}
                                        />
                                    );
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


            {/* Modal de Asignar Áreas a Usuario (sin cambios funcionales mayores) */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                { /* ... Contenido del diálogo de asignación de áreas ... */}
                <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Asignar Áreas a {selectedUserCuil}
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialog}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {cargando ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <MuiTextField
                                fullWidth
                                variant="outlined"
                                label="Filtrar áreas disponibles"
                                value={areaFilterDialog}
                                onChange={(e) => setAreaFilterDialog(e.target.value)}
                                sx={{ mb: 2, mt: 1 }}
                                InputProps={{
                                    endAdornment: areaFilterDialog && (
                                        <IconButton onClick={() => setAreaFilterDialog('')} edge="end" size="small">
                                            <CloseIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: '300px', overflowY: 'auto', p: 0.5 }}>
                                {areasDisponibles
                                    .filter(area => {
                                        const configAreasAsignadas = configuraciones.areasAsignadas;
                                        let yaAsignada = false;
                                        if (configAreasAsignadas && selectedUserCuil) {
                                            const userRow = configAreasAsignadas.rows.find(r => r.cuil === selectedUserCuil);
                                            if (userRow && userRow.areasAsignadas.some(a => a.cod === area.cod)) {
                                                yaAsignada = true;
                                            }
                                        }

                                        const filtroDialogoMinusculas = areaFilterDialog.toLowerCase();
                                        const coincideFiltroTexto = area.nombre.toLowerCase().includes(filtroDialogoMinusculas) ||
                                            (area.detalle_ministerio?.nombre || '').toLowerCase().includes(filtroDialogoMinusculas);

                                        return !yaAsignada && coincideFiltroTexto;
                                    })
                                    .map((area) => (
                                        <Chip
                                            key={area.cod}
                                            label={`${area.nombre} (${area.detalle_ministerio?.nombre || 'Sin Min.'})`}
                                            onClick={() => handleAsignarArea(area.cod)}
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': { backgroundColor: 'primary.lighter', borderColor: 'primary.main' },
                                            }}
                                        />
                                    ))
                                }
                                {areasDisponibles.filter(area => {
                                    const configAreasAsignadas = configuraciones.areasAsignadas;
                                    let yaAsignada = false;
                                    if (configAreasAsignadas && selectedUserCuil) {
                                        const userRow = configAreasAsignadas.rows.find(r => r.cuil === selectedUserCuil);
                                        if (userRow && userRow.areasAsignadas.some(a => a.cod === area.cod)) {
                                            yaAsignada = true;
                                        }
                                    }
                                    const filtroDialogoMinusculas = areaFilterDialog.toLowerCase();
                                    const coincideFiltroTexto = area.nombre.toLowerCase().includes(filtroDialogoMinusculas) ||
                                        (area.detalle_ministerio?.nombre || '').toLowerCase().includes(filtroDialogoMinusculas);
                                    return !yaAsignada && coincideFiltroTexto;
                                }).length === 0 && (
                                        <Typography variant="body2" sx={{ p: 1, color: 'text.secondary', width: '100%', textAlign: 'center' }}>
                                            {areaFilterDialog ? `No se encontraron áreas disponibles para "${areaFilterDialog}".` : "No hay más áreas disponibles para asignar o todas coinciden con el filtro."}
                                        </Typography>
                                    )}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleCloseDialog}>Cerrar</MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AltaBajaModificion;