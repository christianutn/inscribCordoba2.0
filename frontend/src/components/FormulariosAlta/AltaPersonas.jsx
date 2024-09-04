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
import {postPersona} from "../../services/personas.service.js";
const AltaPersona = () => {

    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargando, setCargando] = useState(false);

    const [apellido, setApellido] = useState("");
    const [nombre, setNombre] = useState("");
    const [cuil, setCuil] = useState("");
    const [mail, setMail] = useState("");
    const [celular, setCelular] = useState("");


    useEffect(() => {
        (async () => {
            try {
                setCargando(true);
                const user = await getMyUser();


                if (!user.cuil) {
                    navigate("/login");
                    return
                }

            } catch (error) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setSuccess(false);
                setError(error.message);
            } finally {
                setCargando(false);
            }
        })();
    }, []);

    const validarDatos = () => {
        if (!cuil) {
            throw new Error("El cuil es requerido");
        } else if (cuil.length !== 11) {
            throw new Error("El cuil debe tener 11 digitos. Sin guíones y sin espacios");
        }

        if (!apellido) {
            throw new Error("El apellido es requerido");
        }

        if (!nombre) {
            throw new Error("El nombre es requerido");
        }

        if (celular && celular.length !== 10) {
            throw new Error("El celular debe tener 10 digitos por ejemplo 3512345678");
        }
    }

    const limpiarFormulario = () => {
        setCuil("");
        setApellido("");
        setNombre("");
        setMail("");
        setCelular("");
    }

    const handleEnviar = async () => {
        try {

            setCargando(true);
            validarDatos();

            //Función para agregar
           
            await postPersona({
                cuil: cuil,
                apellido: apellido,
                nombre: nombre,
                mail: mail,
                celular: celular
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
                <div className='container-alta-persona'>
                    <div className='titulo'><Titulo texto='Alta nuevo curso' /></div>
                    <div className="divider">
                        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                    </div>
                    <div className="Cuil">
                        <TextField label={"Cuil"} type={"text"} getValue={(value) => setCuil(value)} value={cuil}/>
                    </div>

                    <div className="apellido">
                        <TextField label={"Apellido"} type={"text"} getValue={(value) => setApellido(value)} value={apellido}/>
                    </div>

                    <div className="nombre">
                        <TextField label={"Nombre"} type={"text"} getValue={(value) => setNombre(value)} value={nombre}/>
                    </div>

                    <div className="mail">
                        <TextField label={"Email"} type={"email"} getValue={(value) => setMail(value)} value={mail}/>
                    </div>

                    <div className="celular">
                        <TextField label={"Celular"} type={"text"} getValue={(value) => setCelular(value)} value={celular}/>
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

export default AltaPersona