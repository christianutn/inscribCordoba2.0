import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { forwardRef } from 'react';

const Input = forwardRef(({ label, getValue, type }, ref) => {
  return (
    <Box
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >
      <div>
        <TextField
          id="outlined-number"
          label={label}
          type={type||"number"}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(event) => getValue(event.target.value)}
          ref={ref}
        />
      </div>
    </Box>
  );
});

export default Input;
