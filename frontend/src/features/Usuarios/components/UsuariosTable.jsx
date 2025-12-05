import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const UsuariosTable = ({ data, onEdit }) => {
    const columns = [
        { field: 'cuil', headerName: 'CUIL', width: 120 },
        {
            field: 'nombre',
            headerName: 'Nombre',
            width: 150,
            valueGetter: (value, row) => row.detalle_persona?.nombre || 'N/A'
        },
        {
            field: 'apellido',
            headerName: 'Apellido',
            width: 150,
            valueGetter: (value, row) => row.detalle_persona?.apellido || 'N/A'
        },
        {
            field: 'mail',
            headerName: 'Email',
            width: 200,
            valueGetter: (value, row) => row.detalle_persona?.mail || 'N/A'
        },
        {
            field: 'celular',
            headerName: 'Celular',
            width: 150,
            valueGetter: (value, row) => row.detalle_persona?.celular || 'Sin celular'
        },
        {
            field: 'area',
            headerName: 'Área',
            width: 150,
            valueGetter: (value, row) => row.detalle_area?.nombre || 'Sin área'
        },
        {
            field: 'rol',
            headerName: 'Rol',
            width: 150,
            valueGetter: (value, row) => row.detalle_rol?.nombre || 'N/A'
        },
        {
            field: 'esExcepcionParaFechas',
            headerName: 'Excepción Fechas',
            width: 150,
            valueGetter: (value, row) => row.esExcepcionParaFechas == 1 ? 'Si' : 'No'
        },
        {
            field: 'necesitaCbioContrasenia',
            headerName: 'Necesita Cambio Contraseña',
            width: 150,
            valueGetter: (value, row) => row.necesitaCbioContrasenia == 1 ? 'Si' : 'No'
        },
        {
            field: 'activo',
            headerName: 'Activo',
            width: 150,
            valueGetter: (value, row) => row.activo == 1 ? 'Si' : 'No'
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
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
                getRowId={(row) => row.cuil}
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

export default UsuariosTable;
