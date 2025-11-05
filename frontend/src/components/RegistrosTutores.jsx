import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyUser } from "../services/usuarios.service.js";
import Titulo from './fonts/TituloPrincipal';
import { Divider } from "@mui/material";
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Button from "./UIElements/Button.jsx";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from "./UIElements/TextField.jsx";
import { getRoles } from "../services/roles.service.js"
import Autocomplete from "./UIElements/Autocomplete.jsx";
import { getAreas } from "../services/areas.service.js";
import {postUser} from "../services/usuarios.service.js"

const RegistrosTutores = () => {

    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [roles, setRoles] = useState([]);
    const [areas, setAreas] = useState([]);
    const [seletedRol, setSelectedRol] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [cuil, setCuil] = useState(null);


    useEffect(() => {
        (async () => {
            try {
                setCargando(true);
                const user = await getMyUser();


                if (!user.cuil) {
                    navigate("/login");
                    return
                }

                const listaRoles = await getRoles();
                setRoles(listaRoles);

                const listaAreas = await getAreas();
                setAreas(listaAreas);


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
        setCuil("");
        setSelectedRol(null);
        setSelectedArea(null);
    }


    const handleEnviar = async () => {
        try {

            setCargando(true);


            //Función para agregar
            await postUser({
                cuil: cuil,
                area: areas.find(area => area.nombre === selectedArea)?.cod,
                rol: roles.find(rol => rol.nombre === seletedRol)?.cod,
                contrasenia: cuil
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
                    sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={cargando}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            }

            <form>
                <div className='container-alta-usuario'>
                    <div className='titulo'><Titulo texto='Alta de usuario' /></div>
                    <div className="divider">
                        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                    </div>

                    <div className="cuil">
                        <TextField label="Cuil" value={cuil} getValue={(value) => setCuil(value)}></TextField>
                    </div>
                    <div className="rol">
                        <Autocomplete
                            label="Rol"
                            options={roles.map(rol => rol.nombre)}
                            value={seletedRol}
                            getValue={(value) => {setSelectedRol(value)}}
                        />
                    </div>
                    <div className="area">
                        <Autocomplete

                            label="Área"
                            options={areas.map(area => area.nombre)}
                            value={selectedArea}
                            getValue={(value) => setSelectedArea(value)}
                        />
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

export default RegistrosTutores