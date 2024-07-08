import { Autocomplete, TextField } from "@mui/material"
import { useState } from "react"

const Select = ({label, options}) => {

  const [value, setValue] = useState("")

    return(
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={options}
          sx={{ width: '100%' }}
          renderInput={(params) => <TextField {...params} label={label}
          onChange={(e) => setValue("Este si")}
          
          />}
        />
    )
}

export default Select