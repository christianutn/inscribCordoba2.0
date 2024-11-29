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

import { postMedioInscripcion } from "../../services/mediosInscripcion.service.js";
const MediosDeInscripcion = () => {

    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");

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

    const limpiarFormulario = () => {
        setCodigo("");
        setNombre("");
    }

    const validarDatos = () => {
        if (!codigo) {
            throw new Error("El código es requerido");
        }

        if (codigo.length > 15) {
            throw new Error("El código no puede ser mayor a 15 caracteres");
        }

        if (!nombre) {
            throw new Error("El nombre es requerido");
        }
    }

    const handleEnviar = async () => {
        try {

            setCargando(true);
            validarDatos();

            //Función para agregar
            await postMedioInscripcion({
                cod: codigo,
                nombre: nombre
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
                <div className='container-alta-simple'>
                    <div className='titulo'><Titulo texto='Alta de nuevo medio de inscripción' /></div>
                    <div className="divider">
                        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                    </div>

                    <div className="codigo">
                        <TextField label={"Código"} type={"text"} getValue={(value) => setCodigo(value)} value={codigo} />
                    </div>

                    <div className="nombre">
                        <TextField label={"Nombre"} type={"text"} getValue={(value) => setNombre(value)} value={nombre} />
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

export default MediosDeInscripcion