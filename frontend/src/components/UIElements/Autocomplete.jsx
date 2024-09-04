import { Autocomplete, TextField } from "@mui/material";


const Select = ({ label, options, getValue, value }) => {

  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={options}
      value={value}
      onChange={(event, newValue) => getValue(newValue)}
      className="custom-select" // Aplicar clase personalizada para estilos
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(params) => <TextField {...params}  label={label} className="custom-textfield" />} // Aplicar clase personalizada al TextField
    />
  );
};

export default Select;
