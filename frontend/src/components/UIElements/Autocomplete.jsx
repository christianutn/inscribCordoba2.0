
import { Autocomplete, TextField } from "@mui/material";

const Select = ({ label, options, getValue, value }) => {

  // options es una lista de opciones a mostrar por ejemplo ["Opción 1", "opción 2", "Opción 3"]
  // getValue es una funcion que recibe el valor de la opcion seleccionada y la setea en value del componente padre

  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={options}
      value={value}
     
      onChange={(event, newValue) => {
   
        getValue(newValue);
      }}
      sx={{ width: '100%' }}
      isOptionEqualToValue={(option, value) => option.value === value.value} // Revisar: Se implementa para solucionar advertencia en consola del navegador
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default Select;
