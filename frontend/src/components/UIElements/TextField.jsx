import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const Input = ({label}) => {
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
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />
        
        </div>
     
        
      </Box>
    )
}

export default Input