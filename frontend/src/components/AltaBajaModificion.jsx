import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
import { useState, useEffect } from "react";
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
import SelectEditInputCell from "./UIElements/SelectEditInputCell.jsx";
import { DataGrid } from "@mui/x-data-grid";
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Box from '@mui/material/Box';
import { Divider } from '@mui/material';
import Alert from '@mui/material/Alert';
import { descargarExcel } from "../services/excel.service.js";
import { useNavigate } from "react-router-dom";
import { getAreasAsignadas, deleteAreaAsignada, postAreaAsignada } from "../services/areasAsignadasUsuario.service";
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';




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
        }
    }
    // Use state
    const [selectOption, setSelectOption] = useState("");
    const [dataAMostrar, setDataAMostrar] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [configuraciones, setConfiguraciones] = useState({});

    // Use effect

    const [ministerios, setMinisterios] = useState([]);
    const [areas, setAreas] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [tutores, setTutores] = useState([]);
    const [tiposCapacitaciones, setTiposCapacitaciones] = useState([]);
    const [mediosInscripcion, setMediosInscripciones] = useState([]);
    const [plataformasDictado, setPlataformasDictado] = useState([]);
    const [roles, setRoles] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUserCuil, setSelectedUserCuil] = useState(null);
    const [areaFilter, setAreaFilter] = useState('');
    const [areasDisponibles, setAreasDisponibles] = useState([]);

    // Estructura base para setear configuraciones
    useEffect(() => {
        setCargando(true);
        (async () => {
            try {
                const [
                    cursos,
                    ministerios,
                    areas,
                    personas,
                    tutores,
                    tiposCapacitaciones,
                    mediosInscripcion,
                    plataformasDictado,
                    usuarios,
                    roles,
                    areasAsignadas
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

                setCursos(cursos);
                setMinisterios(ministerios);
                setAreas(areas);
                setPersonas(personas);
                setTutores(tutores);
                setTiposCapacitaciones(tiposCapacitaciones);
                setMediosInscripciones(mediosInscripcion);
                setPlataformasDictado(plataformasDictado);
                setRoles(roles);
                setUsuarios(usuarios);


                setConfiguraciones((prevConfiguraciones) => ({
                    ...prevConfiguraciones,
                    cursos: {
                        columns: [
                            { field: 'cod', headerName: 'Código', with: 20 },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            { field: 'cupo', headerName: 'Cupo', with: 20, editable: true },
                            {
                                field: 'plataformaDictado',
                                headerName: 'Pataforma de dictado',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={plataformasDictado.map((e) => ({ value: e.nombre, label: e.nombre }))}
                                        api={params.api}
                                    />
                                ),
                            },
                            {
                                field: 'medioInscripcion',
                                headerName: 'Medio de inscripción',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={mediosInscripcion.map((e) => ({ value: e.nombre, label: e.nombre }))}
                                        api={params.api}
                                    />
                                ),
                            },
                            {
                                field: 'tipoCapacitacion',
                                headerName: 'Tipo de capacitación',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={tiposCapacitaciones.map((e) => ({ value: e.nombre, label: e.nombre, cod: e.cod }))}
                                        api={params.api}
                                    />
                                ),
                            },
                            { field: 'horas', headerName: 'Horas', with: 5, editable: true },
                            { field: 'area', headerName: 'Area', width: 180 },
                            { field: 'ministerio', headerName: 'Ministerio', width: 180 },
                            {
                                field: 'esVigente',
                                headerName: '¿Está vigente?',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={[{ value: "Si", label: "Si" }, { value: "No", label: "No" }]}
                                        api={params.api}
                                    />
                                ),
                            }
                        ],
                        rows: cursos.map((e) => ({
                            id: e.cod, // El DataGrid necesita un ID específico para cada fila
                            cod: e.cod,
                            nombre: e.nombre,
                            cupo: e.cupo,
                            plataformaDictado: e.detalle_plataformaDictado.nombre,
                            medioInscripcion: e.detalle_medioInscripcion.nombre,
                            tipoCapacitacion: e.detalle_tipoCapacitacion.nombre,
                            horas: e.cantidad_horas,
                            area: e.detalle_area.nombre,
                            ministerio: e.detalle_area.detalle_ministerio.nombre,
                            esVigente: e.esVigente ? "Si" : "No",

                        }))
                    },
                    ministerios: {
                        columns: [
                            { field: 'cod', headerName: 'Código de tipo de capacitación', flex: 1, editable: true },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente',
                                headerName: '¿Está vigente?',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={[{ value: "Si", label: "Si" }, { value: "No", label: "No" }]}
                                        api={params.api}
                                    />
                                ),
                            }
                        ],
                        rows: ministerios.map((e, index) => ({
                            id: e.cod, // El DataGrid necesita un ID único para cada fila
                            cod: e.cod,
                            nombre: e.nombre,
                            esVigente: e.esVigente ? "Si" : "No",
                        }))
                    },
                    areas: {
                        columns: [
                            { field: 'cod', headerName: 'Código de tipo de capacitación', flex: 1, editable: true },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            { field: 'ministerio', headerName: 'Ministerio', flex: 1 },
                            {
                                field: 'esVigente',
                                headerName: '¿Está vigente?',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={[{ value: "Si", label: "Si" }, { value: "No", label: "No" }]}
                                        api={params.api}
                                    />
                                ),
                            }
                        ],
                        rows: areas.map((e, index) => ({
                            id: e.cod, // El DataGrid necesita un ID único para cada fila
                            cod: e.cod,
                            nombre: e.nombre,
                            ministerio: e.detalle_ministerio.nombre,
                            esVigente: e.esVigente ? "Si" : "No",

                        }))
                    },
                    personas: {
                        columns: [
                            { field: 'cuil', headerName: 'CUIL', width: 150, editable: true },
                            { field: 'nombre', headerName: 'Nombre', width: 150, editable: true },
                            { field: 'apellido', headerName: 'Apellido', width: 150, editable: true },
                            { field: 'mail', headerName: 'Email', width: 200, editable: true },
                            { field: 'celular', headerName: 'Celular', width: 150, editable: true },
                        ],
                        rows: personas.map((persona) => ({
                            id: persona.cuil,
                            cuil: persona.cuil,
                            nombre: persona.nombre,
                            apellido: persona.apellido,
                            mail: persona.mail,
                            celular: persona.celular || "Sin celular",
                        }))
                    },
                    tutores: {
                        columns: [
                            { field: 'cuil', headerName: 'CUIL', width: 150, editable: true },
                            { field: 'nombre', headerName: 'Nombre', width: 150, editable: true },
                            { field: 'apellido', headerName: 'Apellido', width: 150, editable: true },
                            { field: 'mail', headerName: 'Email', width: 200, editable: true },
                            { field: 'celular', headerName: 'Celular', width: 150, editable: true },
                            {
                                field: 'area',
                                headerName: 'Área',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={areas.map((area) => ({ value: area.nombre, label: area.nombre }))}
                                        api={params.api}
                                    />
                                ),
                            },
                            {
                                field: 'esReferente',
                                headerName: '¿Es Referente?',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={[{ value: "Si", label: "Si" }, { value: "No", label: "No" }]}
                                        api={params.api}
                                    />
                                ),
                            },
                        ],
                        rows: tutores.map((tutor) => ({
                            id: tutor.cuil,
                            cuil: tutor.cuil,
                            nombre: tutor.detalle_persona.nombre,
                            apellido: tutor.detalle_persona.apellido,
                            mail: tutor.detalle_persona.mail,
                            celular: tutor.detalle_persona.celular || 'Sin celular',
                            area: tutor.detalle_area.nombre,
                            esReferente: tutor.esReferente ? "Si" : "No",
                        }))
                    },
                    mediosInscripcion: {
                        columns: [
                            { field: 'cod', headerName: 'Código de tipo de capacitación', flex: 1, editable: true },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente',
                                headerName: '¿Está vigente?',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={[{ value: "Si", label: "Si" }, { value: "No", label: "No" }]}
                                        api={params.api}
                                    />
                                ),
                            }
                        ],
                        rows: mediosInscripcion.map((e) => ({
                            id: e.cod, // El DataGrid necesita un ID único para cada fila
                            cod: e.cod,
                            nombre: e.nombre,
                            esVigente: e.esVigente ? "Si" : "No",
                        }))
                    },
                    plataformasDictado: {
                        columns: [
                            { field: 'cod', headerName: 'Código de Plataforma', flex: 1, editable: true },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente',
                                headerName: '¿Está vigente?',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={[{ value: "Si", label: "Si" }, { value: "No", label: "No" }]}
                                        api={params.api}
                                    />
                                ),
                            }
                        ],
                        rows: plataformasDictado.map((plataforma, index) => ({
                            id: plataforma.cod, // El DataGrid necesita un ID único para cada fila
                            cod: plataforma.cod,
                            nombre: plataforma.nombre,
                            esVigente: plataforma.esVigente ? "Si" : "No"
                        }))
                    },
                    tiposCapacitaciones: {
                        columns: [
                            { field: 'cod', headerName: 'Código de tipo de capacitación', flex: 1, editable: true },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente',
                                headerName: '¿Está vigente?',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={[{ value: "Si", label: "Si" }, { value: "No", label: "No" }]}
                                        api={params.api}
                                    />
                                ),
                            }
                        ],
                        rows: tiposCapacitaciones.map((e, index) => ({
                            id: e.cod, // El DataGrid necesita un ID único para cada fila
                            cod: e.cod,
                            nombre: e.nombre,
                            esVigente: e.esVigente ? "Si" : "No"
                        }))
                    },
                    usuarios: {
                        columns: [
                            { field: 'cuil', headerName: 'CUIL', width: 150, editable: true },
                            { field: 'nombre', headerName: 'Nombre', width: 150, editable: true },
                            { field: 'apellido', headerName: 'Apellido', width: 150, editable: true },
                            { field: 'mail', headerName: 'Email', width: 200, editable: true },
                            { field: 'celular', headerName: 'Celular', width: 150, editable: true },
                            {
                                field: 'area',
                                headerName: 'Área',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={areas.map((area) => ({ value: area.nombre, label: area.nombre }))}
                                        api={params.api}
                                    />
                                ),
                            },
                            {
                                field: 'rol',
                                headerName: 'Rol del Usuario',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={roles.map((rol) => (
                                            {
                                                label: rol.nombre,
                                                value: rol.nombre,
                                            }
                                        ))}
                                        api={params.api}
                                    />
                                ),
                            },
                            {
                                field: 'esExcepcionParaFechas',
                                headerName: '¿Es excepción para fechas?',
                                width: 180,
                                editable: true,
                                renderEditCell: (params) => (
                                    <SelectEditInputCell
                                        id={params.id}
                                        value={params.value}
                                        field={params.field}
                                        options={[{ value: "Si", label: "Si" }, { value: "No", label: "No" }]}
                                        api={params.api}
                                    />
                                ),
                            }


                        ],
                        rows: usuarios.map((u) => ({
                            id: u.cuil,
                            cuil: u.cuil,
                            nombre: u.detalle_persona.nombre,
                            apellido: u.detalle_persona.apellido,
                            mail: u.detalle_persona.mail,
                            celular: u.detalle_persona ? u.detalle_persona.celular : 'Sin celular',
                            area: u.area ? u.detalle_area.nombre : 'Sin área',
                            rol: u.detalle_rol.nombre,
                            esExcepcionParaFechas: u.esExcepcionParaFechas == 1 ? 'Si' : 'No',
                        }))
                    },
                    areasAsignadas: {
                        columns: [
                            { field: 'cuil', headerName: 'CUIL', width: 150 },
                            {
                                field: 'areasAsignadas',
                                headerName: 'Áreas asignadas',
                                flex: 1,
                                renderCell: (params) => (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                                                    sx={{
                                                        margin: '2px',
                                                        '& .MuiChip-label': {
                                                            maxWidth: '150px',
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
                                headerName: 'Asignar nueva área',
                                width: 150,
                                renderCell: (params) => (
                                    <IconButton
                                        onClick={() => handleAsignarNuevaArea(params.row.cuil)}
                                        color="primary"
                                    >
                                        <AddCircleIcon />
                                    </IconButton>
                                )
                            }
                        ],
                        rows: areasAsignadas.reduce((acc, asignacion) => {
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
                }));

                setCargando(false);
            } catch (error) {
                setError(error.message);
                setCargando(false);
            }
        })();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setSuccess(false);
        }, 3000);
    }, [success]);

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
    }, [error]);


    const handleDescargarExcel = async () => {

        await descargarExcel(configuraciones[convertirAPropiedadConfig(selectOption)].rows, configuraciones[convertirAPropiedadConfig(selectOption)].columns, "Reporte");
    }

    const handleAgregar = async () => {

        switch (selectOption) {
            case 'Cursos':
                navigate('/cursos/alta');
                break;
            case "Ministerios":
                navigate('/ministerios/alta');
                break;
            case "Áreas":
                navigate("/areas/alta")
                break
            case "Personas":
                navigate('/personas/alta');
                break
            case "Tutores":
                navigate('/tutores/alta');
                break
            case "Medios de Inscripción":
                navigate('/mediosInscripciones/alta');
                break
            case "Plataformas de Dictado":
                navigate('/plataformasDictados/alta');
                break
            case "Usuarios":
                navigate("/usuarios/alta");
                break
            case "Tipos de Capacitación":
                navigate('/tiposCapacitaciones/alta');
                break
            case "Asignar areas a usuarios":
                navigate('/areasAsignadasUsuario/alta');
                break

            default:
                break;
        }


    };


    const [columns, setColumns] = useState([]);
    const actionColumn = {
        field: 'Accion',
        headerName: '',
        flex: 1,
        minWidth: 120, // Ajusta el valor según sea necesario
        renderCell: (params) => (
            <Box className='box-btn-circular'>
                <BotonCircular className='boton-circular' icon="editar" height={40} width={40} onClick={() => handleActionClick('editar', params)} />
                <BotonCircular className='boton-circular' icon="borrar" height={40} width={40} onClick={() => handleActionClick('borrar', params)} />
            </Box>
        ),
    };


    const deleteRowDeConfiguraciones = (propiedad, id) => {

        setConfiguraciones((prevConfiguraciones) => {
            // Filtra las filas para excluir la fila con el id especificado
            const updatedRows = prevConfiguraciones[propiedad].rows.filter((row) => row.id !== id);

            // Devuelve el estado actualizado con las filas modificadas
            return {
                ...prevConfiguraciones,
                [propiedad]: {
                    ...prevConfiguraciones[propiedad],
                    rows: updatedRows
                }
            };
        });
    };

    const updateRowDeConfiguraciones = (propiedad, id, updatedRow) => {
        setConfiguraciones((prevConfiguraciones) => {
            // Actualiza la fila especificada con los nuevos datos
            const updatedRows = prevConfiguraciones[propiedad].rows.map((row) => {
                if (row.id === id) {
                    // Si updatedRow.cod existe, actualiza el id a updatedRow.cod
                    const newId = updatedRow.cod ? updatedRow.cod : updatedRow.cuil;
                    return { ...row, ...updatedRow, id: newId }; // Actualiza el id a newId
                }
                return row;
            });

            // Devuelve el estado actualizado con las filas modificadas
            return {
                ...prevConfiguraciones,
                [propiedad]: {
                    ...prevConfiguraciones[propiedad],
                    rows: updatedRows
                }
            };
        });



    };




    const handleActionClick = async (action, params) => {
        if (action === 'borrar') {
            try {

                setCargando(true);
                await deleteRow(params.id, selectOption);
                window.scrollTo({ top: 0, behavior: 'smooth' });

                setSuccess(true);
                setError(null);
                deleteRowDeConfiguraciones(convertirAPropiedadConfig(selectOption), params.id);

            } catch (error) {

                window.scrollTo({ top: 0, behavior: 'smooth' });
                setError(error.message || "Error al cargar los datos");
                setSuccess(false);
            } finally {
                setCargando(false);
            }
        } else {
            try {

                setCargando(true);

                const updatedRow = {
                    ...params.row,
                    codPlataformaDictado: params.row.plataformaDictado
                        ? plataformasDictado.find(p => p.nombre === params.row.plataformaDictado)?.cod
                        : undefined,
                    codMedioInscripcion: params.row.medioInscripcion
                        ? mediosInscripcion.find(m => m.nombre === params.row.medioInscripcion)?.cod
                        : undefined,
                    codTipoCapacitacion: params.row.tipoCapacitacion
                        ? tiposCapacitaciones.find(t => t.nombre === params.row.tipoCapacitacion)?.cod
                        : undefined,
                    codArea: params.row.area
                        ? areas.find(a => a.nombre === params.row.area)?.cod
                        : undefined,
                    codMinisterio: params.row.ministerio
                        ? ministerios.find(m => m.nombre === params.row.ministerio)?.cod
                        : undefined,
                    codRol: params.row.rol
                        ? roles.find(r => r.nombre === params.row.rol)?.cod
                        : undefined,

                };

                await updateRow(updatedRow, selectOption);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                updateRowDeConfiguraciones(convertirAPropiedadConfig(selectOption), params.id, params.row);

                setSuccess(true);
                setError(null);

                // Si la acción fue exitosa, vuelve a obtener los datos

            } catch (error) {

                window.scrollTo({ top: 0, behavior: 'smooth' });
                setError(error.message || "Error al cargar los datos");
                setSuccess(false);
            } finally {
                setCargando(false);
            }
        }
    };



    const handleSelectOption = (value) => {
        setSelectOption(value);

    };

    const handleDeleteAreaAsignada = async (cuil, codArea) => {
        try {
            setCargando(true);
            await deleteAreaAsignada(cuil, codArea);
            
            setConfiguraciones(prevConfig => {
                const newConfig = { ...prevConfig };
                const areasAsignadasConfig = newConfig.areasAsignadas;
                
                const userRow = areasAsignadasConfig.rows.find(row => row.cuil === cuil);
                if (userRow) {
                    userRow.areasAsignadas = userRow.areasAsignadas.filter(
                        area => area.cod !== codArea
                    );
                    
                    if (userRow.areasAsignadas.length === 0) {
                        areasAsignadasConfig.rows = areasAsignadasConfig.rows.filter(
                            row => row.cuil !== cuil
                        );
                    }
                }
                
                return newConfig;
            });
            
            setSuccess(true);
            setError(null);
            
        } catch (error) {
            setError(error.message || 'Error al eliminar el área asignada');
        } finally {
            setCargando(false);
        }
    };

    const handleAsignarNuevaArea = async (cuil) => {
        setSelectedUserCuil(cuil);
        try {
            setCargando(true);
            const areasData = await getAreas();
            setAreasDisponibles(areasData.filter(area => area.esVigente));
            setOpenDialog(true);
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    const handleAsignarArea = async (codArea) => {
        try {
            setCargando(true);
            await postAreaAsignada({
                cuil_usuario: selectedUserCuil,
                cod_area: codArea
            });
            
            const areaSeleccionada = areasDisponibles.find(area => area.cod === codArea);
            
            setConfiguraciones(prevConfig => {
                const newConfig = { ...prevConfig };
                const areasAsignadasConfig = newConfig.areasAsignadas;
                
                const existingRowIndex = areasAsignadasConfig.rows.findIndex(
                    row => row.cuil === selectedUserCuil
                );
                
                if (existingRowIndex !== -1) {
                    areasAsignadasConfig.rows[existingRowIndex].areasAsignadas.push({
                        cod: areaSeleccionada.cod,
                        nombre: areaSeleccionada.nombre
                    });
                } else {
                    areasAsignadasConfig.rows.push({
                        id: selectedUserCuil,
                        cuil: selectedUserCuil,
                        areasAsignadas: [{
                            cod: areaSeleccionada.cod,
                            nombre: areaSeleccionada.nombre
                        }],
                        asignarNueva: ''
                    });
                }
                
                return newConfig;
            });
            
            setSuccess(true);
            setOpenDialog(false);
            setAreaFilter('');
            setSelectedUserCuil(null);
            
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };



    return (
        <>{
            error &&

            <Alert variant="filled" severity="error" sx={{ width: '100%' }} >
                {error}
            </Alert>

        }
            {
                success &&
                <Alert variant="filled" severity="success" sx={{ width: '100%' }} >
                    Actualizado con éxito
                </Alert>
            }
            {cargando ? (
                <Backdrop
                    sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={cargando}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            ) : (
                <div className="container-abm">
                    <Titulo className="titulo-principal" texto="Alta, Baja y Modificación" />
                    <Divider className="divider" sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                    {
                        !selectOption &&
                        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                            Seleccione una opción para cargar los datos correspondientes.
                        </Alert>
                    }


                    <Autocomplete className="opcion" options={options} label={"Seleccione una Opción"} value={selectOption} getValue={handleSelectOption} />
                    {
                        selectOption &&
                        <div className="btn">
                            <BotonCircular icon="descargar" onClick={handleDescargarExcel} />
                            <BotonCircular icon="agregar" onClick={handleAgregar} />
                        </div>
                    }

                    {
                        selectOption &&

                        <DataGrid className="datagrid"
                            columns={configuraciones && configuraciones[convertirAPropiedadConfig(selectOption)] 
                                ? (selectOption !== "Asignar areas a usuarios" 
                                    ? [...configuraciones[convertirAPropiedadConfig(selectOption)].columns, actionColumn]
                                    : configuraciones[convertirAPropiedadConfig(selectOption)].columns)
                                : []
                            }
                            rows={configuraciones && configuraciones[convertirAPropiedadConfig(selectOption)] 
                                ? configuraciones[convertirAPropiedadConfig(selectOption)].rows 
                                : []
                            }
                            autoHeight
                            autoWidth
                        />
                    }
                </div>
            )}

            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Asignar Nueva Área
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenDialog(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {cargando ? (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            minHeight: '200px' 
                        }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Filtrar áreas"
                                value={areaFilter}
                                onChange={(e) => setAreaFilter(e.target.value)}
                                sx={{ mb: 2, mt: 1 }}
                            />
                            <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 1,
                                maxHeight: '400px',
                                overflow: 'auto'
                            }}>
                                {areasDisponibles
                                    .filter(area => 
                                        area.nombre.toLowerCase().includes(areaFilter.toLowerCase()) ||
                                        area.detalle_ministerio.nombre.toLowerCase().includes(areaFilter.toLowerCase())
                                    )
                                    .map((area) => (
                                        <Chip
                                            key={area.cod}
                                            label={`${area.nombre} (${area.detalle_ministerio.nombre})`}
                                            onClick={() => handleAsignarArea(area.cod)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: 'primary.light',
                                                },
                                                '& .MuiChip-label': {
                                                    maxWidth: 'none'
                                                }
                                            }}
                                        />
                                    ))
                                }
                            </Box>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </>
    );
}; //Hasta aca

export default AltaBajaModificion;