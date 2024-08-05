import Titulo from './fonts/TituloPrincipal';
import Autocomplete from './UIElements/Autocomplete';
import TextField from './UIElements/TextField';
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
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

export default function Formulario() {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const [ministerios, setMinisterios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [mediosInscripcion, setMediosInscripciones] = useState([]);
  const [plataformasDictado, setPlataformasDictado] = useState([]);
  const [tiposCapacitacions, setTiposCapacitaciones] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [error, setError] = useState(null);

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

  const rows = generarDatosTutores();

  const columns = [
    { field: 'cuil', headerName: 'Cuil', width: 150 },
    { field: 'nombre', headerName: 'Nombre', width: 150 },
    { field: 'apellido', headerName: 'Apellido', width: 150 },
    { field: 'mail', headerName: 'Mail', width: 150 },
    {
      field: 'rol',
      headerName: 'Rol del tutor',
      renderEditCell: renderSelectEditInputCell,
      editable: true,
      width: 180,
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
        setError(true);
      }
    })();
  }, []);

  const onSubmit = (data) => {
    console.log("Datos:", data);
  }

  return (
    <>
      <Alert severity="error" sx={{ display: error ? 'block' : 'none', zIndex: 1, width: '100%' }}>{"Mensaje de error"}</Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid-container-formulario'>
          <div className='titulo'><Titulo texto='Formulario de inscripción' /></div>

          <div className='select-ministerio'>
            <Autocomplete options={ministerios.map(ministerio => ministerio.nombre)} label={"Seleccione un ministerio"}
              getValue={(value) => {
                setValue("ministerio", value);

                const ministerioSeleccionado = ministerios.find(ministerio => ministerio.nombre === value);

                if (ministerioSeleccionado) {
                  reset({
                    area: "",
                    curso: "",
                    medioInscripcion: '',
                    plataformaDictado: '',
                    cupo: '',
                    horas: '',
                    fechaInscripcionDesde: "",
                    fechaInscripcionHasta: "",
                    fechaCursadaDesde: "",
                    fechaCursadaHasta: ""
                  });
                  setAreas(ministerioSeleccionado.detalle_areas);
                } else {
                  setAreas([]);
                }

              }}
              {...register("ministerio", {
                validate: (value) => value !== null && value !== "" || "Debe seleccionar un ministerio"
              })}

            />
            {errors.ministerio && <p style={{ color: 'red' }}>{errors.ministerio.message}</p>}
          </div>

          <div className='select-area'>
            <Autocomplete options={areas.map(a => a.nombre)} label={"Seleccione un área"}
              getValue={(value) => {
                setValue("area", value);

                const areaSeleccionada = areas.find(area => area.nombre === value);

                if (areaSeleccionada) {
                  reset({
                    curso: '',
                    medioInscripcion: '',
                    plataformaDictado: '',
                    cupo: '',
                    horas: '',
                    fechaInscripcionDesde: "",
                    fechaInscripcionHasta: "",
                    fechaCursadaDesde: "",
                    fechaCursadaHasta: ""
                  });
                  setCursos(areaSeleccionada.detalle_cursos);
                } else {
                  setCursos([]);
                }

              }}
              {...register("area", {
                validate: (value) => value !== null && value !== "" || "Debe seleccionar un área"
              })}

            />
            {errors.area && <p style={{ color: 'red' }}>{errors.area.message}</p>}
          </div>

          <div className='select-curso'>
            <Autocomplete options={cursos.map(c => c.nombre)} label={"Seleccione un curso"}
              getValue={(value) => {
                setValue("curso", value);
              }}
              {...register("curso", {
                validate: (value) => value !== null && value !== "" || "Debe seleccionar un curso"
              })}
            />
            {errors.curso && <p style={{ color: 'red' }}>{errors.curso.message}</p>}
          </div>

          <div className='select-medio-inscripcion'>
            <Autocomplete options={mediosInscripcion.map(m => m.nombre)} label={"Seleccione medio de inscripción"}
              getValue={(value) => {
                setValue("medioInscripcion", value);
              }}
              {...register("medioInscripcion", {
                validate: (value) => value !== null && value !== "" || "Debe seleccionar un medio de inscripción"
              })} />
            {errors.medioInscripcion && <p style={{ color: 'red' }}>{errors.medioInscripcion.message}</p>}
          </div>

          <div className='select-plataforma-dictado'>
            <Autocomplete options={plataformasDictado.map(p => p.nombre)} label={"Seleccione plataforma de dictado"}
              getValue={(value) => {
                setValue("plataformaDictado", value);
              }}
              {...register("plataformaDictado", {
                validate: (value) => value !== null && value !== "" || "Debe seleccionar una plataforma de dictado"
              })} />
            {errors.plataformaDictado && <p style={{ color: 'red' }}>{errors.plataformaDictado.message}</p>}
          </div>

          <div className='select-tipo-capacitacion'>
            <Autocomplete options={tiposCapacitacions.map(p => p.nombre)} label={"Seleccione tipo de capacitación"}
              getValue={(value) => {
                setValue("tipoCapacitacion", value);
              }}
              {...register("tiposCapacitacion", {
                validate: (value) => value !== null && value !== "" || "Debe seleccionar una plataforma de dictado"
              })} />
            {errors.tiposCapacitacions && <p style={{ color: 'red' }}>{errors.tiposCapacitacions.message}</p>}
          </div>

          <div className='input'>
            <TextField label={"Cupo"} getValue={(value) => setValue("cupo", value)}
              {...register("cupo", {
                validate: (value) => value !== null && value !== "" && value > 0 || "Cupo inválido"
              })} />
            {errors.cupo && <p style={{ color: 'red' }}>{errors.cupo.message}</p>}

            <TextField label={"Cantidad de horas"} getValue={(value) => setValue("horas", value)}
              {...register("horas", {
                validate: (value) => value !== null && value !== "" && value > 0 || "Cantidad de horas inválidas"
              })} />
            {errors.horas && <p style={{ color: 'red' }}>{errors.horas.message}</p>}
          </div>

          <div className='tutores'>
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
                }));

                setTutoresSeleccionados(tutores);
              }}
              rowSelectionModel={rowSelectionModel}
            />

            <TutoresSeleccionados tutors={tutoresSeleccionados} />
          </div>

          <div className='cohortes'>
            <Cohortes register = {register} errors = {errors} setValue = {setValue}></Cohortes>
          </div>

          <div className='submit'>
            <Button mensaje={"Registrar"} type={"submit"} />
          </div>
        </div>
      </form>
    </>
  );
}
