import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AreasTable = ({ data, onEdit }) => {
    const columns = [
        { field: 'cod', headerName: 'Código', width: 120 },
        { field: 'nombre', headerName: 'Nombre', width: 300 },
        {
            field: 'ministerio',
            headerName: 'Ministerio',
            width: 250,
            valueGetter: (value, row) => row.detalle_ministerio?.nombre || row.ministerio || 'N/A'
        },
        {
            field: 'esVigente',
            headerName: '¿Es Vigente?',
            width: 150,
            renderCell: (params) => (
                params.row.esVigente == 1 || params.row.esVigente === true ?
                    <Tooltip title="Vigente"><CheckCircleIcon color="success" /></Tooltip> :
                    <Tooltip title="No Vigente"><CancelIcon color="error" /></Tooltip>
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(params.row)} color="primary" size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.cod}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableRowSelectionOnClick
                density="compact"
            />
        </Box>
    );
};

export default AreasTable;
