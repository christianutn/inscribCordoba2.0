
import { Autocomplete, TextField } from "@mui/material";

const Select = ({ label, options, getValue, value }) => {


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
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default Select;
