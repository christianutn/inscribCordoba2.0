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
          className="custom-textfield"
          id="outlined-number"
          label={label}
          type={type || "number"}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(event) => getValue(event.target.value)}
          value={value}
        />
      </div>
    </Box>
  );
};

export default Input;
