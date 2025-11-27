import { getTutores } from "../../services/tutores.service.js";
import { getAreas } from "../../services/areas.service.js";
import { getAutorizadores } from "../../services/autorizadores.service.js";
import { getCursos } from "../../services/cursos.service.js";
import { getCoordinadores } from "../../services/coordinadores.service.js";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Confirmacion = () => {
    const [tutores, setTutores] = useState([]);
    const [areas, setAreas] = useState([]);
    const [autorizadores, setAutorizadores] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [coordinadores, setCoordinadores] = useState([]);

    const location = useLocation();
    const nota_autorizacion = location.state?.datos; // Aquí recuperas el objeto

    return (
        <div>
            <h1>Confirmacion</h1>
            {
                console.log(nota_autorizacion)
            }
        </div>
    );




};

export default Confirmacion;