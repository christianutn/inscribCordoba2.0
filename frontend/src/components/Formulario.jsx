
import Autorizador from './CardAutorizador'
import CardInfo from './CardInfo'
import CardFecha from './CardFecha'
import Tutores from "./CardTutores";
import Titulo from './fonts/TituloPrincipal'
import Autocomplete from './UIElements/Autocomplete';
import TextField from './UIElements/TextField';
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form"
import Button from "./UIElements/Button"
import { getMinisterios } from "../services/ministerios.service.js"
import Alert from '@mui/material/Alert';



export default function Formulario() {


  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [ministerios, setMinisterios] = useState([]);

  const [error, setError] = useState(null);

  //Logica relacionada al componente de Búsqueda de tutores
  
  const [abrirBusqTutores, setBusqTutores] = useState(false);

  const handleBusqTutores = () => {
    console.log("Manejador de búsqueda de tutores")

    setBusqTutores(true)
  }

  useEffect(() => {


    (async () => {
      try {
        const listaMinisterios = await getMinisterios()
        setMinisterios(listaMinisterios.map(e => e.nombre))
      } catch (error) {
        setError(true)
      }
    })()


  }, [])

  const onSubmit = (data) => {
    console.log("Hola mundo")

  }

  return (

    <>

      <Alert severity="error" sx={{ display: error ? 'block' : 'none', zIndex: 1, width: '100%' }}>{"MEnsaje de error"}</Alert>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='grid-container-formulario'>

          <div className='titulo'><Titulo texto='Formulario de inscripción' /></div>

          <div className='select-ministerio'>
            <Autocomplete options={ministerios} label={"Seleccione un ministerio"} />
          </div>

          <div className='select-area'>
            <Autocomplete options={["Ministerio de Salud", "Ministerio de Educacion", "Ministerio de Defensa Nacional"]} label={"Seleccione un área"} />

          </div>

          <div className='select-curso'>

            <Autocomplete options={["Ministerio de Salud", "Ministerio de Educacion", "Ministerio de Defensa Nacional"]} label={"Seleccione un curso"} />
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
            <Autocomplete options={["Ministerio de Salud", "Ministerio de Educacion", "Ministerio de Defensa Nacional"]} label={"Seleccione medio de inscripción"} />
          </div>
          <div className='select-plataforma-dictado'>
            <Autocomplete options={["Ministerio de Salud", "Ministerio de Educacion", "Ministerio de Defensa Nacional"]} label={"Seleccione plataforma de dictado"} />
          </div>
          <div className='input'>

            <TextField label={"Cupo"} />
            <TextField label={"Cantidad de horas"} />

          </div>

          <div className='card-fecha-inscripcion'>
            <CardFecha titulo={"Fecha de inscripción"} mensajeDesde={"Fecha de inscripción desde"} mensajeHasta={"Fecha de inscripción hasta"} />
          </div>
          <div className='card-fechas-cursada'>
            <CardFecha titulo={"Fecha de cursada"} mensajeDesde={"Fecha de cursada desde"} mensajeHasta={"Fecha de cursada hasta"} />
          </div>
          <div className='card-tutores' >
            <Tutores onClick={handleBusqTutores}/>
          </div>
          <div className='submit'>
            <Button mensaje={"Registrar"} type={"submit"} />
          </div>
        </div>
      </form>
    </>



  );
}

