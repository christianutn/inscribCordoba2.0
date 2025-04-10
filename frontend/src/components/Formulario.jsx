import Titulo from './fonts/TituloPrincipal';
import Autocomplete from './UIElements/Autocomplete';
import TextField from './UIElements/TextField';
import { useState, useEffect } from 'react';
import Button from "./UIElements/Button";
import { getMinisterios } from "../services/ministerios.service.js";
import { getMediosInscripcion } from "../services/mediosInscripcion.service.js";
import { getPlataformasDictado } from "../services/plataformasDictado.service.js";
import { getTiposCapacitacion } from "../services/tiposCapacitacion.service.js";
import { getTutores } from "../services/tutores.service.js";
import { getMyUser } from "../services/usuarios.service.js";
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import { DataGrid, useGridApiContext } from '@mui/x-data-grid';
import TutoresSeleccionados from './TutoresSeleccionados.jsx';
import Cohortes from "./Cohortes.jsx";
import validarFecha from '../services/validarFechas.js';
import { postInstancias } from "../services/instancias.service.js";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import SubtituloPrincipal from './fonts/SubtituloPrincipal.jsx';
import { validarOrdenFechas } from "../services/validarOrdenFechas.js";
import { useNavigate } from 'react-router-dom';
import OpcionesEvento from './OpcionesEvento.jsx';
import CustomInput from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import NuevoEvento from './NuevoEvento.jsx';
import Alerta from "./UIElements/Dialog.jsx";



export default function Formulario() {

  const navigate = useNavigate();

  const [ministerios, setMinisterios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [mediosInscripcion, setMediosInscripciones] = useState([]);
  const [plataformasDictado, setPlataformasDictado] = useState([]);
  const [tiposCapacitaciones, setTiposCapacitaciones] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cargando, setCargando] = useState(false);

  // useState del formuario

  const [selectMinisterio, setSelectMinisterio] = useState("");
  const [selectArea, setSelectArea] = useState("");
  const [selectCurso, setSelectCurso] = useState("");
  const [selectMedioInscripcion, setSelectMedioInscripcion] = useState("");
  const [selectPlataformaDictado, setSelectPlataformaDictado] = useState("");
  const [selectTipoCapacitacion, setSelectTipoCapacitacion] = useState("");
  const [cupo, setCupo] = useState("");
  const [horas, setHoras] = useState("");
  const [cohortes, setCohortes] = useState([]);
  const [comentario, setComentario] = useState("");


  // OPciones de evento

  const [opciones, setOpciones] = useState({
    autogestionado: false,
    edad: false,
    departamento: false,
    publicaPCC: false,
    correlatividad: false
  });




  //Alerta
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [tituloAlerta, setTituloAlerta] = useState('');
  const [mensajeAlerta, setMensajeAlerta] = useState('');

  // Función para actualizar los datos desde el hijo
  const manejarCambioOpciones = (nuevaOpciones) => {
    setOpciones(nuevaOpciones);
  };



  // Data grid de tutores
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [tutoresSeleccionados, setTutoresSeleccionados] = useState([]);

  // Se necesita cargar nuevo evento
  const [nuevoEvento, setNuevoEvento] = useState(false);

  // Función para comprobar si una fila está seleccionada
  const isRowSelected = (id) => rowSelectionModel.includes(id);

  function SelectEditInputCell(props) {
    const { id, value, field } = props;
    const apiRef = useGridApiContext();

    const handleChangeSelect = async (event) => {
      const newValue = event.target.value;
      await apiRef.current.setEditCellValue({ id, field, value: newValue });
      apiRef.current.stopCellEditMode({ id, field });

      setTutores((prevTutores) =>
        prevTutores.map((tutor) =>
          tutor.cuil === id ? { ...tutor, rol: newValue } : tutor
        )
      );
    };

    return (
      <Select
        value={value}
        onChange={handleChangeSelect}
        size="small"
        sx={{ height: 1 }}
        native
        autoFocus
        disabled={isRowSelected(id)} // Deshabilitar si la fila está seleccionada
      >
        <option>Profesor con permiso de edición</option>
        <option>Profesor sin permiso de edición</option>
      </Select>
    );
  }

  const renderSelectEditInputCell = (params) => {
    return <SelectEditInputCell {...params} />;
  };

  const generarDatosTutores = () => {

    const data = tutores.map((tutor) => ({
      id: tutor.cuil,
      cuil: tutor.cuil,
      nombre: tutor.detalle_persona.nombre,
      apellido: tutor.detalle_persona.apellido,
      mail: tutor.detalle_persona.mail,
      rol: tutor.rol || 'Profesor sin permiso de edición', // Añadir rol si no existe
    }));
    return data;
  };

  const rows = generarDatosTutores()

  const columns = [
    { field: 'cuil', headerName: 'Cuil', flex: 1 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'apellido', headerName: 'Apellido', flex: 1 },
    { field: 'mail', headerName: 'Mail', flex: 1 },
    {
      field: 'rol',
      headerName: 'Rol del tutor',
      renderEditCell: renderSelectEditInputCell,
      editable: true,
      flex: 1
    }
  ];

  useEffect(() => {
    (async () => {
      try {

        const user = await getMyUser();


        if (!user.cuil) {
          navigate("/login");
          return
        }

        if (nuevoEvento) return; // Si se renderiza nuevo evento luego tendremos que recargar ministerios para actualizar los datos del curso por si cambian de selección


        limpiarFormulario();
        const listaMinisterios = await getMinisterios();
        setMinisterios(listaMinisterios);

        const listaMediosInscripciones = await getMediosInscripcion();
        setMediosInscripciones(listaMediosInscripciones);

        const listaPlataformasDictados = await getPlataformasDictado();
        setPlataformasDictado(listaPlataformasDictados);

        const listaTiposCapacitacion = await getTiposCapacitacion();
        setTiposCapacitaciones(listaTiposCapacitacion);

        const listaTutores = await getTutores();
        setTutores(listaTutores);

      } catch (error) {
        setError(error.message || "Error al cargar los datos");
      }
    })();
  }, [nuevoEvento]);


  const limpiarFormulario = () => {

    setAreas([]);
    setCursos([]);

    setSelectMinisterio("");
    setSelectArea("");
    setSelectCurso("");
    setSelectMedioInscripcion("");
    setSelectPlataformaDictado("");
    setSelectTipoCapacitacion("");
    setCupo("");
    setHoras("");
    setComentario("");
  };

  const tiene_el_curso_evento_creado = (codCurso) => {
    const curso = cursos.find((curso) => curso.cod === codCurso);
    return curso ? Boolean(curso.tiene_evento_creado) : false;
  };


  const handleCohortes = (cohortes) => {
    setCohortes(cohortes)
  };

  const handleEnviarFormulario = async () => {


    setCargando(true);
    try {



      if (!selectMinisterio) {

        throw new Error("Debe seleccionar un ministerio");


      }

      if (!selectArea) {

        throw new Error("Debe seleccionar una area");

      }

      if (!selectCurso) {
        throw new Error("Debe seleccionar un curso");

      }

      if (!selectTipoCapacitacion) {
        throw new Error("Debe seleccionar un tipo de capacitación");
      }

      if (!selectPlataformaDictado) {
        throw new Error("Debe seleccionar una plataforma de dictado");
      }


      if (!selectMedioInscripcion) {
        throw new Error("Debe seleccionar un medio de inscripción");
      }

      if (!cupo || cupo <= 0) {
        throw new Error("Debe seleccionar un cupo");
      }


      if (!horas || horas <= 0) {
        throw new Error("Debe seleccionar una hora");
      }


      if (tutoresSeleccionados.length === 0) {
        throw new Error("Debe seleccionar al menos un tutor");
      }

      if (cohortes.length === 0) {
        throw new Error("Debe agregar al menos un cohorte");
      }
      cohortes.forEach((cohorte) => {
        if (!validarFecha(cohorte.fechaInscripcionDesde) || !validarFecha(cohorte.fechaInscripcionHasta) || !validarFecha(cohorte.fechaCursadaDesde) || !validarFecha(cohorte.fechaCursadaHasta)) {
          throw new Error("Todos los campos tipo fecha deben estar completos");
        }

        validarOrdenFechas([cohorte.fechaInscripcionDesde, cohorte.fechaInscripcionHasta, cohorte.fechaCursadaDesde, cohorte.fechaCursadaHasta], opciones.autogestionado);

      })

      const codCurso = cursos.find((curso) => curso.nombre === selectCurso)?.cod;
      if (!codCurso) {
        throw new Error("El curso seleccionado no existe al enviar formulario");
      }
      if (!tiene_el_curso_evento_creado(codCurso)) {
        setTituloAlerta("El curso no tiene un evento creado");
        setMensajeAlerta(`Notamos que no completó el formulario de nuevo evento para el curso de '${selectCurso || '(Curso no encontrado)'}'. Por favor, complete primero este formulario y luego podrá cargar 'Nuevas cohortes'`);
        setOpenAlertDialog(true);
        setNuevoEvento(true);
        throw new Error("El curso no tiene un evento creado, por favor cree un evento antes de continuar con la inscripción");
      }

      const newInstancia = await postInstancias({ selectMinisterio, selectArea, selectCurso, selectTipoCapacitacion, selectPlataformaDictado, selectMedioInscripcion, cupo, horas, tutoresSeleccionados, cohortes, opciones, comentario });

      limpiarFormulario();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Si todo es exitoso, puedes limpiar el error
      setError(null);
      setSuccess(true);
      //


    } catch (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccess(false);
      setError(error.message);
    } finally {
      setCargando(false);
    }



  }


  return (
    <>

      {
        error &&

        <Alert className='alert' variant="filled" severity="error" >
          {error}
        </Alert>

      }
      {
        success &&
        <Alert className='alert' variant="filled" severity="success"  >
          Formulario enviado exitosamente
        </Alert>
      }
      {
        cargando && <Backdrop
          sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={cargando}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }

      {
        // si nuevo envento es true, renderiza el componente de nuevo evento, si es false mostrar formulario
        nuevoEvento ? <NuevoEvento
          setNuevoEvento={setNuevoEvento}
          setOpenAlertDialog={setOpenAlertDialog}
          setTituloAlerta={setTituloAlerta}
          setMensajeAlerta={setMensajeAlerta}
          selectCurso={selectCurso}
        /> :
          <form >
            <div className='grid-container-formulario'>
              <div className='titulo'><Titulo texto='Formulario de inscripción' /></div>
              <div className='divider'>
                <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} />
              </div>


              <div className='select-ministerio'>
                <Autocomplete options={ministerios.filter(ministerio => ministerio.esVigente === 1).map(ministerio => ministerio.nombre)} label={"Seleccione un ministerio"} value={selectMinisterio}
                  getValue={(value) => {
                    setSelectMinisterio(value);
                    setSelectArea("")
                    setSelectCurso("")

                    const ministerioSeleccionado = ministerios.find(ministerio => ministerio.nombre === value);

                    if (ministerioSeleccionado) {
                      setAreas(ministerioSeleccionado.detalle_areas);
                      setCursos([]);

                    } else {
                      setAreas([]);
                      setCursos([]);
                    }

                  }}

                />


              </div>

              <div className='select-area'>
                <Autocomplete options={areas.filter(area => area.esVigente === 1).map(area => area.nombre)} label={"Seleccione un área"} value={selectArea}
                  getValue={(value) => {
                    setSelectArea(value);
                    setSelectCurso("")

                    const areaSeleccionada = areas.find(area => area.nombre === value);

                    if (areaSeleccionada) {

                      setCursos(areaSeleccionada.detalle_cursos);
                    } else {
                      setCursos([]);
                    }

                  }}


                />

              </div>

              <div className='select-curso'>
                <Autocomplete options={cursos.filter(c => c.esVigente === 1).map(c => c.nombre)} label={"Seleccione un curso"} value={selectCurso}
                  getValue={(value) => {
                    setSelectCurso(value);
                    const codCurso = cursos.find((curso) => curso.nombre === value)?.cod;
                    if (!tiene_el_curso_evento_creado(codCurso)) {
                      setTituloAlerta("El curso no tiene un evento creado");
                      setMensajeAlerta(`Notamos que no completó el formulario de nuevo evento para el curso de '${selectCurso || '(Curso no encontrado)'}'. Por favor, complete primero este formulario y luego podrá cargar 'Nuevas cohortes'`);
                      setOpenAlertDialog(true);
                      setNuevoEvento(true);
                    }
                  }}

                />

              </div>

              <div className='select-medio-inscripcion'>
                <Autocomplete options={mediosInscripcion.filter(m => m.esVigente === 1).map(m => m.nombre)} label={"Seleccione medio de inscripción"} value={selectMedioInscripcion}
                  getValue={(value) => {
                    setSelectMedioInscripcion(value);
                  }}
                />

              </div>

              <div className='select-plataforma-dictado'>
                <Autocomplete options={plataformasDictado.filter(p => p.esVigente === 1).map(p => p.nombre)} label={"Seleccione plataforma de dictado"} value={selectPlataformaDictado}
                  getValue={(value) => {
                    setSelectPlataformaDictado(value);
                  }}
                />

              </div>

              <div className='select-tipo-capacitacion'>
                <Autocomplete options={tiposCapacitaciones.filter(t => t.esVigente === 1).map(t => t.nombre)} label={"Seleccione tipo de capacitación"} value={selectTipoCapacitacion}
                  getValue={(value) => {
                    setSelectTipoCapacitacion(value);
                  }}
                />

              </div>

              <div className='input'>
                <TextField label={"Cupo"} getValue={(value) => setCupo(value)} value={cupo}
                />
                <TextField label={"Cantidad de horas"} getValue={(value) => setHoras(value)} value={horas}
                />


              </div>

              <div className='opciones-evento'>
                <OpcionesEvento opciones={opciones} onOpcionesChange={manejarCambioOpciones} />
              </div>

              <div>

              </div>

              <div className='tutores'>
                <SubtituloPrincipal texto='Selección de tutores' />
                <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                <DataGrid rows={rows} columns={columns}
                  autoHeight
                  checkboxSelection
                  disableRowSelectionOnClick
                  loading={rows.length === 0}
                  onRowSelectionModelChange={(newRowSelectionModel) => {
                    setRowSelectionModel(newRowSelectionModel);

                    const listaTutores = newRowSelectionModel.map((id) =>
                      rows.find((row) => row.id === id)
                    );

                    const tutores = listaTutores.map((tutor) => ({
                      name: `${tutor.nombre} ${tutor.apellido}`,
                      rol: tutor.rol,
                      initials: `${tutor.nombre[0]}${tutor.apellido[0]}`,
                      cuil: tutor.cuil,
                    }));

                    setTutoresSeleccionados(tutores);
                  }}
                  rowSelectionModel={rowSelectionModel}
                />

                <TutoresSeleccionados tutors={tutoresSeleccionados} />
              </div>

              <div className='cohortes'>
                <Cohortes getCohortes={handleCohortes}></Cohortes>

              </div>

              <div className='submit'>
                <Button mensaje={"Registrar"} type="button" hanldeOnClick={handleEnviarFormulario} />
              </div>
              <Tooltip title="En caso de aplicar restricciones como edad, correlatividad, departamento  ó cualquier aclaración relevante, favor de completar el campo de comentario"
                placement="top"

                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#333', // Fondo oscuro
                      color: '#fff', // Texto blanco
                      fontSize: '16px', // Tamaño de letra más grande
                      maxWidth: '400px', // Ancho máximo del tooltip
                      padding: '12px', // Espaciado interno
                      borderRadius: '8px', // Bordes redondeados
                    },
                  },
                }}
              >
                <div className='comentario'>
                  <CustomInput
                    id="outlined-multiline-static"
                    label="Comentario"
                    multiline
                    rows={4}
                    fullWidth
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                    
                  />
                </div>
              </Tooltip>

            </div>
          </form>

      }
      {
        <Alerta
          openAlertDialog={openAlertDialog}
          setOpenAlertDialog={setOpenAlertDialog}
          titulo={tituloAlerta}
          mensaje={mensajeAlerta} />
      }

    </>
  );
}
