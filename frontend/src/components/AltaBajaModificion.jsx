import DataGrid from "./UIElements/DataGrid";
import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
import { useState } from "react";

const AltaBajaModificion = () => {

const options = ["Opcion 1", "Opcion 2", "Opcion 3"]

//Use state

const [selectOption, setSelectOption] = useState("");



//Manejadores

const handleSelectOption = (value) => {
    setSelectOption(value)
}
    return (
        <div className="container-abm">
            <Titulo texto="Alta, Baja y Modificación"/>
            <Autocomplete options={options} label={"Seleccione una Opción"} value={selectOption} getValue={handleSelectOption}/>
            
            <DataGrid />
        </div>
    );
};
export default AltaBajaModificion