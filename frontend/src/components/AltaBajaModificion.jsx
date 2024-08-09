import DataGrid from "./DataGridAbm";
import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
import { useState } from "react";

const AltaBajaModificion = () => {

const options = ["Opcion 1", "Opcion 2", "Opcion 3"]

//Use state

const [selectOption, setSelectOption] = useState("");

const datosAMostrar = [["Celda 1", "Celda 2"],["Dato fila 1 C1", "Dato fila 1 C2"],["Dato fila 2 C1", "Dato fila 2 C2"]]



//Manejadores

const handleSelectOption = (value) => {
    setSelectOption(value)
}
    return (
        <div className="container-abm">
            <Titulo texto="Alta, Baja y Modificación"/>
            <Autocomplete options={options} label={"Seleccione una Opción"} value={selectOption} getValue={handleSelectOption}/>
            
            <DataGrid datosAMostrar={datosAMostrar}/>
        </div>
    );
};
export default AltaBajaModificion