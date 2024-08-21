import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';


const Input = ({ label, getValue, type, value, width }) => {
  return (
    <Box
      sx={{
        '& .MuiTextField-root': { m: 0, width: "100%" },
      }}
      noValidate
      autoComplete="off"
    >
      <div>
        <TextField
          sx={{ width: "100%" }}
          id="outlined-number"
          label={label}
          type={type||"number"}
          InputLabelProps={{
            shrink: true,
            sx: { fontSize: "20px" }, // Ajusta este valor según el tamaño que desees
          }}
          onChange={(event) => getValue(event.target.value)}
          value={value}
        />
      </div>
    </Box>
  );
};

export default Input;
