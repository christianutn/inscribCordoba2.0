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
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import { DataGrid, useGridApiContext } from '@mui/x-data-grid';
import TutoresSeleccionados from './TutoresSeleccionados.jsx';
import Cohortes from "./Cohortes.jsx";
import validarFecha from '../services/validarFechas.js';
import { postInstancias } from "../services/instancias.service.js";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Divider } from '@mui/material';
import SubtituloPrincipal from './fonts/SubtituloPrincipal.jsx';
import {validarOrdenFechas} from "../services/validarOrdenFechas.js";


export default function Formulario() {


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


  // Data grid de tutores
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [tutoresSeleccionados, setTutoresSeleccionados] = useState([]);

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
  }, []);

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
  };


  const handleCohortes = (cohortes) => {
    setCohortes(cohortes)
  };

  const handleEnviarFormulario = async () => {

    console.log("Formulario enviado: ", { selectMinisterio, selectArea, selectCurso, selectTipoCapacitacion, selectPlataformaDictado, selectMedioInscripcion, cupo, horas, tutoresSeleccionados, cohortes });
    setCargando(true);
    try {

      if (selectMinisterio === "") {

        throw new Error("Debe seleccionar un ministerio");


      }

      if (selectArea === "") {

        throw new Error("Debe seleccionar una area");

      }

      if (selectCurso === "") {
        throw new Error("Debe seleccionar un curso");

      }

      if (selectTipoCapacitacion === "") {
        throw new Error("Debe seleccionar un tipo de capacitación");
      }

      if (selectPlataformaDictado === "") {
        throw new Error("Debe seleccionar una plataforma de dictado");
      }


      if (selectMedioInscripcion === "") {
        throw new Error("Debe seleccionar un medio de inscripción");
      }

      if (cupo === "" || cupo <= 0) {
        throw new Error("Debe seleccionar un cupo");
      }


      if (horas === "" || horas <= 0) {
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
          throw new Error("Debe completar las fechas");
        }

        if(validarOrdenFechas([cohorte.fechaInscripcionDesde, cohorte.fechaInscripcionHasta, cohorte.fechaCursadaDesde, cohorte.fechaCursadaHasta]) === false){
          throw new Error("Fechas de cohorte no válidas. Las fechas no son coherentes");
        }
        
      })

      const newInstancia = await postInstancias({ selectMinisterio, selectArea, selectCurso, selectTipoCapacitacion, selectPlataformaDictado, selectMedioInscripcion, cupo, horas, tutoresSeleccionados, cohortes });


      console.log("Instancia creada:", newInstancia);



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

        <Alert variant="filled" severity="error" sx={{ width: '100%' }} >
          {error}
        </Alert>

      }
      {
        success &&
        <Alert variant="filled" severity="success" sx={{ width: '100%' }} >
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

      <form >
        <div className='grid-container-formulario'>
          <div className='titulo'><Titulo texto='Formulario de inscripción' /></div>

          <div className='select-ministerio'>
            <Autocomplete options={ministerios.map(ministerio => ministerio.nombre)} label={"Seleccione un ministerio"} value={selectMinisterio}
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
            <Autocomplete options={areas.map(a => a.nombre)} label={"Seleccione un área"} value={selectArea}
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
            <Autocomplete options={cursos.map(c => c.nombre)} label={"Seleccione un curso"} value={selectCurso}
              getValue={(value) => {
                setSelectCurso(value);
              }}

            />

          </div>

          <div className='select-medio-inscripcion'>
            <Autocomplete options={mediosInscripcion.map(m => m.nombre)} label={"Seleccione medio de inscripción"} value={selectMedioInscripcion}
              getValue={(value) => {
                setSelectMedioInscripcion(value);
              }}
            />

          </div>

          <div className='select-plataforma-dictado'>
            <Autocomplete options={plataformasDictado.map(p => p.nombre)} label={"Seleccione plataforma de dictado"} value={selectPlataformaDictado}
              getValue={(value) => {
                setSelectPlataformaDictado(value);
              }}
            />

          </div>

          <div className='select-tipo-capacitacion'>
            <Autocomplete options={tiposCapacitaciones.map(p => p.nombre)} label={"Seleccione tipo de capacitación"} value={selectTipoCapacitacion}
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
        </div>
      </form>
    </>
  );
}
