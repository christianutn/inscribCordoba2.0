import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from '../UIElements/Autocomplete.jsx';
import TextField from '../UIElements/TextField';
import { getMyUser } from "../../services/usuarios.service.js";
import Titulo from '../fonts/TituloPrincipal';
import { Divider } from "@mui/material";
import BotonCircular from "../UIElements/BotonCircular.jsx";
import Button from "../UIElements/Button.jsx";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { postCurso } from "../../services/cursos.service.js";
import { getMinisterios } from "../../services/ministerios.service.js";
import { getMediosInscripcion } from "../../services/mediosInscripcion.service.js";
import { getPlataformasDictado } from "../../services/plataformasDictado.service.js";
import { getTiposCapacitacion } from "../../services/tiposCapacitacion.service.js";





const AltaCurso = () => {

    const navigate = useNavigate();

    const [ministerios, setMinisterios] = useState([]);
    const [areas, setAreas] = useState([]);

    const [mediosInscripcion, setMediosInscripciones] = useState([]);
    const [plataformasDictado, setPlataformasDictado] = useState([]);
    const [tiposCapacitaciones, setTiposCapacitaciones] = useState([]);

    const [selectMinisterio, setSelectMinisterio] = useState("");
    const [selectArea, setSelectArea] = useState("");

    const [selectMedioInscripcion, setSelectMedioInscripcion] = useState("");
    const [selectPlataformaDictado, setSelectPlataformaDictado] = useState("");
    const [selectTipoCapacitacion, setSelectTipoCapacitacion] = useState("");
    const [cupo, setCupo] = useState("");
    const [horas, setHoras] = useState("");

    const [codCurso, setCodCurso] = useState("");
    const [nombreCurso, setNombreCurso] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const [cargando, setCargando] = useState(false);

    const handleVolver = () => {
        navigate("/principal");
    }

    const limpiarFormulario = () => {

        setSelectMedioInscripcion("");
        setSelectPlataformaDictado("");
        setSelectTipoCapacitacion("");
        setCupo("");
        setHoras("");
        setCodCurso("");
        setNombreCurso("");
    }


    const validarDatosCurso = () => {
        if (!selectMinisterio) {

            throw new Error("Debe seleccionar un ministerio");
    
    
          }
    
          if (!selectArea) {
    
            throw new Error("Debe seleccionar una area");
    
          }
    
          if (!nombreCurso) {
            throw new Error("Debe ingresar nombre de curso");
    
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
            throw new Error("El cupo debe ser un entero mayor a 0");
          }
    
    
          if (!horas|| horas <= 0) {
            throw new Error("La cantidad de horas deben ser un entero mayor a 0");
          }
    }
    const handleEnviar = async () => {
        try {
            setCargando(true);

            validarDatosCurso();

            await postCurso({
                cod: codCurso,
                nombre: nombreCurso,
                area: areas.find(area => area.nombre === selectArea)?.cod,
                medio_inscripcion: mediosInscripcion.find(medio => medio.nombre === selectMedioInscripcion)?.cod,
                plataforma_dictado: plataformasDictado.find(plataforma => plataforma.nombre === selectPlataformaDictado)?.cod,
                tipo_capacitacion: tiposCapacitaciones.find(tipo => tipo.nombre === selectTipoCapacitacion)?.cod,
                cupo: cupo,
                cantidad_horas: horas
            });

            setSuccess(true);
            setError(false);
            limpiarFormulario();

        } catch (error) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSuccess(false);
            setError(error.message);
        } finally{
            setCargando(false); 
        }
    }

    useEffect(() => {
        (async () => {
            try {

                const user = await getMyUser();


                if (!user.cuil) {
                    navigate("/login");
                    return
                }

                const listaMinisterios = await getMinisterios();
                setMinisterios(listaMinisterios);

                const listaMediosInscripciones = await getMediosInscripcion();
                setMediosInscripciones(listaMediosInscripciones);

                const listaPlataformasDictados = await getPlataformasDictado();
                setPlataformasDictado(listaPlataformasDictados);

                const listaTiposCapacitacion = await getTiposCapacitacion();
                setTiposCapacitaciones(listaTiposCapacitacion);



            } catch (error) {
                setError(error.message || "Error al cargar los datos");
            }
        })();
    }, []);
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

            <form action="">
                <div className='container-alta-curso'>
                    <div className='titulo'><Titulo texto='Alta nuevo curso' /></div>
                    <div className="divider">
                        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                    </div>

                    <div className="select-ministerio">
                        <Autocomplete options={ministerios.map(ministerio => ministerio.nombre)} label={"Seleccione un ministerio"} value={selectMinisterio}
                            getValue={(value) => {
                                setSelectMinisterio(value);
                                setSelectArea("")


                                const ministerioSeleccionado = ministerios.find(ministerio => ministerio.nombre === value);

                                if (ministerioSeleccionado) {
                                    setAreas(ministerioSeleccionado.detalle_areas);


                                } else {
                                    setAreas([]);

                                }

                            }}

                        />
                    </div>

                    <div className="select-area">
                        <Autocomplete options={areas.map(a => a.nombre)} label={"Seleccione un área"} value={selectArea}
                            getValue={(value) => {
                                setSelectArea(value)
                            }} />

                    </div>

                    <div className="curso">
                        <TextField label={"Ingrese nombre del curso"} value={nombreCurso} width={"100ch"} type={"text"}
                            getValue={(value) => {
                                setNombreCurso(value)
                            }}
                        />
                    </div>

                    <div className="select-medio-inscripcion">
                        <Autocomplete options={mediosInscripcion.map(m => m.nombre)} label={"Seleccione medio de inscripción"} value={selectMedioInscripcion}
                            getValue={(value) => {
                                setSelectMedioInscripcion(value);
                            }}
                        />
                    </div>



                    <div className="select-plataforma-dictado">
                        <Autocomplete options={plataformasDictado.map(p => p.nombre)} label={"Seleccione plataforma de dictado"} value={selectPlataformaDictado}
                            getValue={(value) => {
                                setSelectPlataformaDictado(value);
                            }}
                        />

                    </div>


                    <div className="select-tipo-capacitacion">
                        <Autocomplete options={tiposCapacitaciones.map(p => p.nombre)} label={"Seleccione tipo de capacitación"} value={selectTipoCapacitacion}
                            getValue={(value) => {
                                setSelectTipoCapacitacion(value);
                            }}
                        />
                    </div>

                    <div className="input">
                        <TextField label={"Ingrese código de curso"} value={codCurso} type={"text"}
                            getValue={(value) => {
                                setCodCurso(value)
                            }}
                        />

                        <TextField label={"Cupo"} getValue={(value) => setCupo(value)} value={cupo}
                        />


                        <TextField label={"Cantidad de horas"} getValue={(value) => setHoras(value)} value={horas}
                        />

                    </div>

                    <div className="volver">
                        <BotonCircular icon={"volver"} onClick={handleVolver}></BotonCircular>
                    </div>

                    <div className="enviar">
                        <Button type="button" mensaje={"Enviar"} hanldeOnClick={handleEnviar}></Button>
                    </div>
                </div>

            </form>




        </>

    )
}

export default AltaCurso