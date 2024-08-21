import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from '../UIElements/TextField';
import { getMyUser } from "../../services/usuarios.service.js";
import Titulo from '../fonts/TituloPrincipal';
import { Divider } from "@mui/material";
import BotonCircular from "../UIElements/BotonCircular.jsx";
import Button from "../UIElements/Button.jsx";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { getMinisterios } from "../../services/ministerios.service.js";
import Autocomplete from "../../components/UIElements/Autocomplete.jsx";
import { postTutores } from "../../services/tutores.service.js";
const AltaTutores = () => {

    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [cuil, setCuil] = useState("");
    const [esReferente, setEsReferente] = useState("");

    const [ministerios, setMinisterios] = useState([]);
    const [areas, setAreas] = useState([]);

    const [selectMinisterio, setSelectMinisterio] = useState("");
    const [selectArea, setSelectArea] = useState("");



    useEffect(() => {
        (async () => {
            try {
                setCargando(true);
                const user = await getMyUser();


                if (!user.cuil) {
                    navigate("/login");
                    return
                }

                const listMinisterios = await getMinisterios();
                setMinisterios(listMinisterios);

            } catch (error) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setSuccess(false);
                setError(error.message);
            } finally {
                setCargando(false);
            }
        })();
    }, []);

    const limpiarFormulario = () => {
        setSelectMinisterio("");
        setSelectArea("");
        setCuil("");
        setEsReferente("");
    }

    const validarDatos = () => {
        if (!cuil) {
            throw new Error("El cuil es requerido");
        } else if (cuil.length !== 11) {
            throw new Error("El cuil debe ser de 11 caracteres");
        }

        if (!selectArea) {
            throw new Error("El área es requerida");
        }

        if (!esReferente) {
            throw new Error("El referente es requerido");
        }
    }

    const handleEnviar = async () => {
        try {

            setCargando(true);
            validarDatos();

            //Función para agregar
            await postTutores({
                cuil: cuil,
                area: areas.find(area => area.nombre === selectArea)?.cod,
                esReferente: esReferente
            });


            setSuccess(true);
            setError(false);
            limpiarFormulario();

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

            <form>
                <div className='container-alta-tutor'>
                    <div className='titulo'><Titulo texto='Alta nuevo curso' /></div>
                    <div className="divider">
                        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                    </div>

                    <div className="ministerio">
                        <Autocomplete
                            label={"Seleccione un ministerio"}
                            options={ministerios.map(ministerio => ministerio.nombre)}
                            value={selectMinisterio}
                            getValue={(value) => {
                                setSelectMinisterio(value);
                                setSelectArea("")
                                const ministerioSeleccionado = ministerios.find(ministerio => ministerio.nombre === value);

                                if (ministerioSeleccionado) {
                                    setAreas(ministerioSeleccionado.detalle_areas)

                                } else {
                                    setAreas([]);
                                }

                            }}
                        />
                    </div>

                    <div className="area">
                        <Autocomplete options={areas.map(a => a.nombre)} label={"Seleccione un área"} value={selectArea}
                            getValue={(value) => {
                                setSelectArea(value);

                            }}
                        />
                    </div>
                    <div className="cuil">
                        <TextField label={"Cuil"} type={"text"} getValue={(value) => setCuil(value)} value={cuil} />
                    </div>
                    <div className="referente">
                        <Autocomplete options={["Si", "No"]} label={"Referente"}
                            getValue={(value) => setEsReferente(value)} value={esReferente} />
                    </div>
                    <div className="volver">
                        <BotonCircular icon={"volver"} onClick={() => navigate("/principal")}></BotonCircular>
                    </div>

                    <div className="enviar">
                        <Button type="button" mensaje={"Enviar"} hanldeOnClick={handleEnviar}></Button>
                    </div>
                </div>

            </form>
        </>
    )
}

export default AltaTutores