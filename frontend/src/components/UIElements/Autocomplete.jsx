import { Autocomplete, TextField } from "@mui/material"

const Select = ({label, options}) => {


    return(
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={options}
          sx={{ width: '100%' }}
          renderInput={(params) => <TextField {...params} label={label} />}
        />
    )
}

export default Select