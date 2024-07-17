import Autorizador from './CardAutorizador';
import CardInfo from './CardInfo';
import CardFecha from './CardFecha';
import Tutores from "./CardTutores";
import Titulo from './fonts/TituloPrincipal';
import Autocomplete from './UIElements/Autocomplete';
import TextField from './UIElements/TextField';
import { useState, useEffect, useContext } from 'react';
import { useForm } from "react-hook-form";
import Button from "./UIElements/Button";
import { getMinisterios } from "../services/ministerios.service.js";
import Alert from '@mui/material/Alert';
import { DataContextTutores } from "../components/context/Formulario.context.jsx";
import BusquedaTutores from './BusquedaTutores.jsx';

export default function Formulario() {
  // Variables de contexto
  const { tutores, mostrar } = useContext(DataContextTutores);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const [ministerios, setMinisterios] = useState([]);

  const [areas, setAreas] = useState([]);

  const [cursos, setCursos] = useState([]);

  const [medioInscripcions, setMedioInscripciones] = useState([]);
  const [plataformaDictados, setPlataformaDictados] = useState([]);
  const [tipoCapacitacions, setTipoCapacitaciones] = useState([]);
  
  const [error, setError] = useState(null);

  // Logica relacionada al componente de Búsqueda de tutores
  const [abrirBusqTutores, setBusqTutores] = useState(false);

  const handleBusqTutores = () => {
    setBusqTutores(true);
  }

  useEffect(() => {
    (async () => {
      try {
        const listaMinisterios = await getMinisterios();
        setMinisterios(listaMinisterios);

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
      {
        console.log("AREAS:", areas)
      }
      {
        mostrar === "Formulario" &&
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid-container-formulario'>
            <div className='titulo'><Titulo texto='Formulario de inscripción' /></div>

            <div className='select-ministerio'>
              <Autocomplete options={ministerios.map(ministerio => ministerio.nombre)} label={"Seleccione un ministerio"}
                getValue={(value) => {
                  setValue("ministerio", value); // Actualiza el valor del formulario

                  // Encuentra el ministerio seleccionado
                  const ministerioSeleccionado = ministerios.find(ministerio => ministerio.nombre === value);

                  // Si se encuentra el ministerio, actualiza las áreas
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
              {
                errors.ministerio && <p style={{ color: 'red' }}>{errors.ministerio.message}</p>
              }

            </div>

            <div className='select-area'>
              <Autocomplete options={areas.map(a => a.nombre)} label={"Seleccione un área"}
                getValue={(value) => {
                  setValue("area", value)

                  // Encuentra el area seleccionado
                  const areaSeleccionada = areas.find(area => area.nombre === value);

                  // Si se encuentra el ministerio, actualiza las áreas
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
              {
                errors.area && <p style={{ color: 'red' }}>{errors.area.message}</p>
              }
            </div>

            <div className='select-curso'>
              <Autocomplete options={cursos.map(c => c.nombre)} label={"Seleccione un curso"}
                getValue={(value) => {
                  setValue("curso", value)
                }}
                {...register("curso", {
                  validate: (value) => value !== null && value !== "" || "Debe seleccionar un curso"
                })}
              />
              {
                errors.curso && <p style={{ color: 'red' }}>{errors.curso.message}</p>
              }
            </div>

            <div className='card-autorizador'>
              <Autorizador />
            </div>
            <div className='card-info1'>
              <CardInfo titulo={"Acumulado cantidad de cupos otorgados"} dato={"10596"} />
            </div>
            <div className='card-info2'>
              <CardInfo titulo={"Acumulado cantidad de inscriptos"} dato={"50632"} />
            </div>
            <div className='card-info3'>
              <CardInfo titulo={"Recomendación para cantidad de cupos"} dato={"6987"} />
            </div>
            <div className='select-medio-inscripcion'>
              <Autocomplete options={["Ministerio de Salud", "Ministerio de Educacion", "Ministerio de Defensa Nacional"]} label={"Seleccione medio de inscripción"}
                getValue={(value) => {
                  setValue("medioInscripcion", value); // Actualiza el valor del formulario
                }}
                {...register("medioInscripcion", {
                  validate: (value) => value !== null && value !== "" || "Debe seleccionar un medio de inscripción"
                })} />
              {
                errors.medioInscripcion && <p style={{ color: 'red' }}>{errors.medioInscripcion.message}</p>
              }
            </div>
            <div className='select-plataforma-dictado'>
              <Autocomplete options={["Ministerio de Salud", "Ministerio de Educacion", "Ministerio de Defensa Nacional"]} label={"Seleccione plataforma de dictado"}
                getValue={(value) => {
                  setValue("plataformaDictado", value);
                }}
                {...register("plataformaDictado", {
                  validate: (value) => value !== null && value !== "" || "Debe seleccionar una plataforma de dictado"
                })} />
              {
                errors.plataformaDictado && <p style={{ color: 'red' }}>{errors.plataformaDictado.message}</p>
              }
            </div>
            <div className='input'>
              <TextField label={"Cupo"} getValue={(value) => setValue("cupo", value)}
                {...register("cupo", {
                  validate: (value) => value !== null && value !== "" && value > 0 || "Cupo inválido"
                })} />

              {
                errors.cupo && <p style={{ color: 'red' }}>{errors.cupo.message}</p>
              }
              <TextField label={"Cantidad de horas"} getValue={(value) => setValue("horas", value)}
                {...register("horas", {
                  validate: (value) => value !== null && value !== "" && value > 0 || "Cantidad de horas inválidas"
                })} />

              {
                errors.horas && <p style={{ color: 'red' }}>{errors.horas.message}</p>
              }
            </div>

            <div className='card-fecha-inscripcion'>
              <CardFecha
                titulo={"Fecha de inscripción"}
                mensajeDesde={"Fecha de inscripción desde"}
                mensajeHasta={"Fecha de inscripción hasta"}
                getFechaDesde={(newFecha) => setValue("fechaInscripcionDesde", newFecha)}
                getFechaHasta={(newFecha) => setValue("fechaInscripcionHasta", newFecha)}
                errors = {errors}
                registerDesde={register("fechaInscripcionDesde", {
                  validate: (value) => value !== null && value !== "" 
                })}
                registerHasta={register("fechaInscripcionHasta", {
                  validate: (value) => value !== null && value !== "" 
                })}
              />
              {
                (errors.fechaInscripcionDesde || errors.fechaInscripcionHasta) && <p style={{ color: 'red' }}>{"Debe seleccionar una fecha de inscripción"}</p>
              }
              
            </div>
            <div className='card-fechas-cursada'>
              <CardFecha
                titulo={"Fecha de Cursada"}
                mensajeDesde={"Fecha de cursada desde"}
                mensajeHasta={"Fecha de cursada hasta"}
                getFechaDesde={(newFecha) => setValue("fechaCursadaDesde", newFecha)}
                getFechaHasta={(newFecha) => setValue("fechaCursadaHasta", newFecha)}
                registerDesde={register("fechaCursadaDesde", {
                  validate: (value) => value !== null && value !== "" 
                })}
                registerHasta={register("fechaCursadaHasta", {
                  validate: (value) => value !== null && value !== ""
                })}
              />

              {
                (errors.fechaCursadaDesde || errors.fechaCursadaHasta) && <p style={{ color: 'red' }}>{"Debe seleccionar una fecha de Cursada"}</p>
              }
            

            </div>
            <div className='card-tutores' >
              <Tutores onClick={handleBusqTutores} />
            </div>
            <div className='submit'>
              <Button mensaje={"Registrar"} type={"submit"} />
            </div>
          </div>
        </form>
      }
      {
        mostrar === "BusquedaTutores" &&
        <BusquedaTutores />
      }
    </>
  );
}
