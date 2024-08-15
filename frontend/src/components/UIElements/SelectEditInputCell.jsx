import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { useGridApiContext } from '@mui/x-data-grid';

const SelectEditInputCell = ({ id, value, field, options }) => {
    const apiRef = useGridApiContext();

    const handleChangeSelect = async (event) => {
        const newValue = event.target.value;

        // Actualiza el valor visible (nombre)
        await apiRef.current.setEditCellValue({ id, field, value: newValue });
        
        // Detiene el modo de edición para la celda actual
        apiRef.current.stopCellEditMode({ id, field });
    };

    return (
        <Select
            value={value || ""}
            onChange={handleChangeSelect}
            size="small"
            sx={{ height: 1 }}
            autoFocus
        >
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    );
};

export default SelectEditInputCell;
