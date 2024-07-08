import React, { useState, forwardRef } from "react";
import { Autocomplete, TextField } from "@mui/material";

const Select = forwardRef(({ label, options, getValue }, ref) => {


  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={options}
  
      onChange={(event, newValue) => {
   
        getValue(newValue);
      }}
      sx={{ width: '100%' }}
      renderInput={(params) => <TextField {...params} label={label} ref={ref} />}
    />
  );
});

export default Select;
