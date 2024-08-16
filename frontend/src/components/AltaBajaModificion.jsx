//import DataGrid from "./DataGridAbm";
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
import {descargarExcel} from "../services/excel.service.js";

const AltaBajaModificion = () => {
    const options = ["Cursos", "Ministerios", "Áreas", "Personas", "Tutores", "Medios de Inscripción", "Plataformas de Dictado", "Tipos de Capacitación", "Usuarios"];

    // Use state
    const [selectOption, setSelectOption] = useState("");
    const [dataAMostrar, setDataAMostrar] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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

    useEffect(() => {
        if (cargando !== true) {
            setCargando(true);
        }

        (async () => {
            const cursos = await getCursos();
            setCursos(cursos);
            const ministerios = await getMinisterios();
            setMinisterios(ministerios);
            const areas = await getAreas();
            setAreas(areas);
            const personas = await getPersonas();
            setPersonas(personas);
            const tutores = await getTutores();
            setTutores(tutores);
            const tiposCapacitaciones = await getTiposCapacitacion();
            setTiposCapacitaciones(tiposCapacitaciones);
            const mediosInscripcion = await getMediosInscripcion();
            setMediosInscripciones(mediosInscripcion);
            const plataformasDictado = await getPlataformasDictado();
            setPlataformasDictado(plataformasDictado);
            const roles = await getRoles();
            setRoles(roles);
            const usuarios = await getUsuarios();
            setUsuarios(usuarios)

            if (success) {
                await getDatosAMostrar(selectOption);

            }

            setCargando(false);


        })()

    }, [selectOption]);


    const handleDescargarExcel = async () => {
        console.log("dataAMostrar:", dataAMostrar);
        console.log("columns:", columns);
        await descargarExcel(dataAMostrar ,columns, "Reporte");
    }


    const [columns, setColumns] = useState([]);
    const actionColumn = {
        field: 'Accion',
        headerName: '',
        flex: 1,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 1, width: '60px', flexDirection: 'row' }}>
                <BotonCircular icon="editar" height={40} width={40} onClick={() => handleActionClick('editar', params)} />
                <BotonCircular icon="borrar" height={40} width={40} onClick={() => handleActionClick('borrar', params)} />
            </Box>
        ),
    };

    const handleActionClick = async (action, params) => {
        if (action === 'borrar') {
            try {
                console.log("Borrando:", params.id);
                setCargando(true);
                await deleteRow(params.id, selectOption);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setSelectOption("");
                setSuccess(true);
                setError(null);
            } catch (error){

                window.scrollTo({ top: 0, behavior: 'smooth' });
                setError(error.message || "Error al cargar los datos");
                setSuccess(false);
            } finally {
                setCargando(false);
            }
        } else {
            try {
                console.log("PARAMS:", params);
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
                setSelectOption("");
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


    const getDatosAMostrar = async (selectOption) => {
        setCargando(true);
        try {
            switch (selectOption) {

                case "Cursos":

                    setColumns([
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
                        { field: 'ministerio', headerName: 'Ministerio', width: 180 }
                    ]);

                    setDataAMostrar(cursos.map((e) => ({
                        id: e.cod, // El DataGrid necesita un ID específico para cada fila
                        cod: e.cod,
                        nombre: e.nombre,
                        cupo: e.cupo,
                        plataformaDictado: e.detalle_plataformaDictado.nombre,
                        medioInscripcion: e.detalle_medioInscripcion.nombre,
                        tipoCapacitacion: e.detalle_tipoCapacitacion.nombre,
                        horas: e.cantidad_horas,
                        area: e.detalle_area.nombre,
                        ministerio: e.detalle_area.detalle_ministerio.nombre

                    })));
                    break;

                case "Ministerios":



                    setColumns([
                        { field: 'cod', headerName: 'Código de tipo de capacitación', flex: 1, editable: true },
                        { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                    ]);

                    // Formateo de los datos para el DataGrid
                    setDataAMostrar(ministerios.map((e, index) => ({
                        id: e.cod, // El DataGrid necesita un ID único para cada fila
                        cod: e.cod,
                        nombre: e.nombre
                    })));
                    break;

                case "Áreas":


                    setColumns([
                        { field: 'cod', headerName: 'Código de tipo de capacitación', flex: 1, editable: true },
                        { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                        { field: 'ministerio', headerName: 'Ministerio', flex: 1 },
                    ]);

                    // Formateo de los datos para el DataGrid
                    setDataAMostrar(areas.map((e, index) => ({
                        id: e.cod, // El DataGrid necesita un ID único para cada fila
                        cod: e.cod,
                        nombre: e.nombre,
                        ministerio: e.detalle_ministerio.nombre
                    })));
                    break;

                case "Personas":
                    setColumns([
                        { field: 'cuil', headerName: 'CUIL', width: 150, editable: true },
                        { field: 'nombre', headerName: 'Nombre', width: 150, editable: true },
                        { field: 'apellido', headerName: 'Apellido', width: 150, editable: true },
                        { field: 'mail', headerName: 'Email', width: 200, editable: true },
                        { field: 'celular', headerName: 'Celular', width: 150, editable: true },
                    ]);



                    setDataAMostrar(personas.map((persona) => ({
                        id: persona.cuil,
                        cuil: persona.cuil,
                        nombre: persona.nombre,
                        apellido: persona.apellido,
                        mail: persona.mail,
                        celular: persona.celular || "Sin celular",
                    })));
                    break

                case "Tutores":
                    setColumns([
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

                    ]);

                    // Formateo de los datos para el DataGrid
                    setDataAMostrar(tutores.map((tutor, index) => ({
                        id: tutor.cuil,
                        cuil: tutor.cuil,
                        nombre: tutor.detalle_persona.nombre,
                        apellido: tutor.detalle_persona.apellido,
                        mail: tutor.detalle_persona.mail,
                        celular: tutor.detalle_persona.celular || 'Sin celular',
                        area: tutor.detalle_area.nombre,
                        esReferente: tutor.esReferente == "1" ? "Si" : "No"
                    })));



                    break
                case "Medios de Inscripción":



                    setColumns([
                        { field: 'cod', headerName: 'Código de tipo de capacitación', flex: 1, editable: true },
                        { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                    ]);

                    // Formateo de los datos para el DataGrid
                    setDataAMostrar(mediosInscripcion.map((e) => ({
                        id: e.cod, // El DataGrid necesita un ID único para cada fila
                        cod: e.cod,
                        nombre: e.nombre
                    })));
                    break
                case "Tipos de Capacitación":


                    setColumns([
                        { field: 'cod', headerName: 'Código de tipo de capacitación', flex: 1, editable: true },
                        { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                    ]);

                    // Formateo de los datos para el DataGrid
                    setDataAMostrar(tiposCapacitaciones.map((e, index) => ({
                        id: e.cod, // El DataGrid necesita un ID único para cada fila
                        cod: e.cod,
                        nombre: e.nombre
                    })));
                    break
                case "Plataformas de Dictado":


                    setColumns([
                        { field: 'cod', headerName: 'Código de Plataforma', flex: 1, editable: true },
                        { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                    ]);

                    // Formateo de los datos para el DataGrid
                    setDataAMostrar(plataformasDictado.map((plataforma, index) => ({
                        id: plataforma.cod, // El DataGrid necesita un ID único para cada fila
                        cod: plataforma.cod,
                        nombre: plataforma.nombre
                    })));
                    break
                case "Usuarios":

                    setColumns([
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


                    ]);

                    // Formateo de los datos para el DataGrid
                    setDataAMostrar(usuarios.map((u) => ({
                        id: u.cuil,
                        cuil: u.cuil,
                        nombre: u.detalle_persona.nombre,
                        apellido: u.detalle_persona.apellido,
                        mail: u.detalle_persona.mail,
                        celular: u.detalle_persona ? u.detalle_persona.celular : 'Sin celular',
                        area: u.area ? u.detalle_area.nombre : 'Sin área',
                        rol: u.detalle_rol.nombre
                    })));



                    break

                default:
                    setDataAMostrar([]);
                    break;
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setCargando(false);
        }
    };

    const handleSelectOption = (value) => {
        setSelectOption(value);
        getDatosAMostrar(value);
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
                    <Titulo texto="Alta, Baja y Modificación" />
                    <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                    <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                        Seleccione una opción para cargar los datos correspondientes.
                    </Alert>


                    <Autocomplete options={options} label={"Seleccione una Opción"} value={selectOption} getValue={handleSelectOption} />
                    
                    <BotonCircular icon="descargar" onClick={handleDescargarExcel} />
                    <DataGrid columns={[...columns, actionColumn]} rows={dataAMostrar} autoHeight autowidth />
                </div>
            )}
           


        </>
    );
}; //Hasta aca

export default AltaBajaModificion;
