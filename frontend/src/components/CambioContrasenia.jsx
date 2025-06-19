import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from './UIElements/TextField';
import { getMyUser } from "../services/usuarios.service.js";
import Titulo from './fonts/TituloPrincipal';
import { Divider } from "@mui/material";
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Button from "./UIElements/Button.jsx";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { cambiarContrasenia } from "../services/usuarios.service.js";
const CambioContrasenia = () => {

    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [nuevaContrasenia, setNuevaContrasenia] = useState("");
    const [nuevaContraseniaConfirmada, setNuevaContraseniaConfirmada] = useState("");

    useEffect(() => {
        (async () => {
            try {
                setCargando(true);/*
                const user = await getMyUser();


                if (!user) {
                    navigate("/login");
                    return
                }
*/

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
        setNuevaContrasenia("");
        setNuevaContraseniaConfirmada("");
    }

    const validarDatos = () => {
        if (!nuevaContrasenia) {
            throw new Error("Es necesario una nueva contraseña");
        }

        if (!nuevaContraseniaConfirmada) {
            throw new Error("Es necesario confirmar la nueva contraseña");
        }

        if (nuevaContrasenia !== nuevaContraseniaConfirmada) {
            throw new Error("Las contraseñas no coinciden");
        }

       
    }

    const handleEnviar = async () => {
        try {

            setCargando(true);
            validarDatos();

            //Función para cambiar contraseña
            await cambiarContrasenia(nuevaContrasenia);
            setSuccess(true);
            setError(false);
            limpiarFormulario();

            setTimeout(() => {
                
                localStorage.removeItem("jwt");
                navigate("/login");
            }, 3000)

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
                    Contraseña actualizada con éxito. Deberá ingresar nuevamente con su clave nueva. 
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
                <div className='container-cambio-contrasenia'>
                    <div>
                        <Titulo texto='Cambio de contraseña' />

                        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                            Es necesario el cambio de su contraseña
                        </Alert>
                    </div>

                    <div>
                        <TextField className="custom-textfield" label={"Nueva contraseña"} type={"password"} getValue={(value) => setNuevaContrasenia(value)} value={nuevaContrasenia} />
                    </div>
                    <div>
                        <TextField className="custom-textfield" label={"Repite la nueva contraseña"} type={"password"} getValue={(value) => setNuevaContraseniaConfirmada(value)} value={nuevaContraseniaConfirmada} />

                    </div>
                    <div>
                        <BotonCircular icon={"volver"} onClick={() => navigate("/principal")}></BotonCircular>
                    </div>
                    <div>
                        <Button type="button" mensaje={"Enviar"} hanldeOnClick={handleEnviar}></Button>

                    </div>


                </div>

            </form>
        </>
    )
}

export default CambioContrasenia