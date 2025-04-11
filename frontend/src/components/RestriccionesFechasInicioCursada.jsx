import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from './UIElements/TextField';
import { getMyUser } from "../services/usuarios.service.js";
import Titulo from './fonts/TituloPrincipal';
import { Divider } from "@mui/material";
import Button from "./UIElements/Button.jsx";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Autocomplete from "../components/UIElements/Autocomplete.jsx";
import { getRestricciones, putRestriccion } from "../services/restricciones.service.js";
import DetalleFechasPorDia from "./DetalleFechas.jsx";
import Subtitulo from "./fonts/SubtituloPrincipal.jsx";
import DetalleMes from "./DetalleMes.jsx";

const RestriccionesFechasInicioCursada = () => {

    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [selectedMes, setSelectedMes] = useState(null);
    const [maximoCuposMensual, setMaximoCuposMensual] = useState("");
    const [maximoCuposDiario, setMaximoCuposDiario] = useState("");
    const [maximoCursosMensual, setMaximoCursosMensual] = useState("");
    const [maximoCursosDiario, setMaximoCursosDiario] = useState("");
    const [maximoAcumulado, setMaximoAcumulado] = useState("");
    const listaMeses = ["Sin Bloqueo", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];




    useEffect(() => {
        (async () => {
            try {
                setCargando(true);
                const user = await getMyUser();


                if (!user.cuil) {
                    navigate("/login");
                    return
                }

                const rest = await getRestricciones();
                setSelectedMes(listaMeses[rest.mesBloqueado]);
                setMaximoCuposDiario(rest.maximoCuposXDia);
                setMaximoCuposMensual(rest.maximoCuposXMes);
                setMaximoCursosDiario(rest.maximoCursosXDia);
                setMaximoCursosMensual(rest.maximoCursosXMes);
                setMaximoAcumulado(rest.maximoAcumulado);



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

    }

    const isValidInteger = (value) => {
        // Convertir el valor a número
        const number = Number(value);

        // Verificar si es un número entero y mayor que cero
        return Number.isInteger(number) && number > 0;
    }

    const validarDatos = () => {
        //Garantizar que los valores sean numéricos y positivos. Ejmplo maximoCuposDiario: 100, maximoCuposMensual: 1000

        if (!isValidInteger(maximoCursosDiario)) {
            throw new Error("El maximo de cursos diarios debe ser un numero entero positivo");
        }
        if (!isValidInteger(maximoCursosMensual)) {
            throw new Error("El maximo de cursos mensuales debe ser un numero entero positivo");
        }
        if (!isValidInteger(maximoCuposDiario)) {
            throw new Error("El maximo de cupos diarios debe ser un numero entero positivo");
        }
        if (!isValidInteger(maximoCuposMensual)) {
            throw new Error("El maximo de cupos mensuales debe ser un numero entero positivo");
        }
    }

    const handleEnviar = async () => {
        try {

            setCargando(true);
            validarDatos();

            //Función para agregar
            await putRestriccion({ mesBloqueado: listaMeses.indexOf(selectedMes), maximoCursosXDia: maximoCursosDiario, maximoCursosXMes: maximoCursosMensual, maximoCuposXDia: maximoCuposDiario, maximoCuposXMes: maximoCuposMensual, maximoAcumulado: maximoAcumulado });


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
                    Restricciones actualizadas con éxito
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
                <div className='container-restricciones'>
                    <div className='titulo'><Titulo texto='Restricciones' /></div>
                    <div className="divider">
                        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                    </div>

                    <div className="inputs-limites">
                        <TextField label={"Límite de cursos por mes"} type={"number"} value={maximoCursosMensual} getValue={(value) => setMaximoCursosMensual(value)}></TextField>
                        <TextField label={"Límite de cupos por mes"} type={"number"} value={maximoCuposMensual} getValue={(value) => setMaximoCuposMensual(value)}></TextField>
                        <TextField label={"Límite de cursos por día"} type={"number"} value={maximoCursosDiario} getValue={(value) => setMaximoCursosDiario(value)}></TextField>
                        <TextField label={"Límite de cupos por día"} type={"number"} value={maximoCuposDiario} getValue={(value) => setMaximoCuposDiario(value)}></TextField>
                        <TextField label={"Máximo acumulado de cursos"} type={"number"} value={maximoAcumulado} getValue={(value) => setMaximoAcumulado(value)}></TextField>
                        <Autocomplete label={"Mes bloqueado"} options={listaMeses} value={selectedMes}
                            getValue={(value) => setSelectedMes(value)} ></Autocomplete>


                    </div>

                    <div className="enviar">
                        <Button type="button" mensaje={"Modificar"} hanldeOnClick={handleEnviar}></Button>
                    </div>

                    <div className="detalle-container">
                        <div className="detalle-fechas">
                            <DetalleFechasPorDia maximoCuposDiario={maximoCuposDiario} maximoCursosDiario={maximoCursosDiario} maximoAcumulado={maximoAcumulado} />
                        </div>
                        <div className="detalle-mes">
                            <DetalleMes maximoCuposMensual={maximoCuposMensual} maximoCursosMensual={maximoCursosMensual} />
                        </div>
                    </div>

                </div>
            </form>
        </>
    )
}

export default RestriccionesFechasInicioCursada