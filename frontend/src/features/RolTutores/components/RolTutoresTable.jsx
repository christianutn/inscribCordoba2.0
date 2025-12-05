import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const RolTutoresTable = ({ data, onVerTutores }) => {
    const columns = [
        {
            field: 'nombre',
            headerName: 'Nombre del Curso',
            flex: 1,
            minWidth: 250
        },
        {
            field: 'area',
            headerName: 'Área',
            width: 250,
            valueGetter: (value, row) => row.detalle_area?.nombre || 'N/A'
        },
        {
            field: 'ministerio',
            headerName: 'Ministerio',
            width: 250,
            valueGetter: (value, row) => row.detalle_area?.detalle_ministerio?.nombre || 'N/A'
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Ver Tutores">
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => onVerTutores(params.row)}
                        >
                            Ver Tutores
                        </Button>
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

export default RolTutoresTable;
