import React from 'react';
import { IconButton, Paper, Typography, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';

const TutoresTable = ({ tutores, onEdit }) => {
    const columns = [
        { field: 'cuil', headerName: 'CUIL', width: 130 },
        {
            field: 'nombre',
            headerName: 'Nombre',
            width: 200,
            valueGetter: (value, row) => row.detalle_persona?.nombre || ''
        },
        {
            field: 'apellido',
            headerName: 'Apellido',
            width: 200,
            valueGetter: (value, row) => row.detalle_persona?.apellido || ''
        },
        {
            field: 'mail',
            headerName: 'Email',
            width: 250,
            valueGetter: (value, row) => row.detalle_persona?.mail || 'Sin mail'
        },
        {
            field: 'celular',
            headerName: 'Celular',
            width: 150,
            valueGetter: (value, row) => row.detalle_persona?.celular || 'Sin celular'
        },
        {
            field: 'esReferente',
            headerName: 'Es Referente',
            width: 120,
            type: 'boolean',
            renderCell: (params) => params.value === 1 ? 'Si' : 'No'
        },
        {
            field: 'area',
            headerName: 'Área',
            width: 200,
            valueGetter: (value, row) => row.detalle_area?.nombre || ''
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <IconButton color="primary" onClick={() => onEdit(params.row)}>
                    <EditIcon />
                </IconButton>
            )
        }
    ];

    return (
        <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Listado de Tutores</Typography>
            </Box>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={tutores || []}
                    columns={columns}
                    getRowId={(row) => row.cuil} // Assuming CUIL is unique and used as ID
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    disableSelectionOnClick
                    localeText={{
                        noRowsLabel: 'No hay tutores registrados',
                        footerRowSelected: (count) => `${count} fila(s) seleccionada(s)`,
                    }}
                />
            </div>
        </Paper>
    );
};

export default TutoresTable;
