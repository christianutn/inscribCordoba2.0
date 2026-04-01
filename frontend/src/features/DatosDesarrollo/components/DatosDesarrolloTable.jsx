import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, Chip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CodeIcon from '@mui/icons-material/Code';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const MESES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DatosDesarrolloTable = ({ data, usuarios = [], onEdit, onDelete }) => {
    const columns = [
        {
            field: 'periodo',
            headerName: 'Período',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (value, row) => `${MESES[row.mes]} ${row.anio}`,
            renderCell: (params) => (
                <Chip
                    label={`${MESES[params.row.mes]} ${params.row.anio}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        {
            field: 'usuario',
            headerName: 'Desarrollador',
            width: 220,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (value, row) => {
                const u = usuarios.find(user => user.cuil === row.cuil);
                const persona = u?.detalle_persona;
                if (persona && (persona.nombre || persona.apellido)) {
                    return `${persona.nombre || ''} ${persona.apellido || ''}`.trim();
                }
                return row.cuil || 'N/A';
            }
        },
        {
            field: 'cuil',
            headerName: 'CUIL',
            width: 140,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'lineas_cod_modificadas',
            headerName: 'Líneas Modificadas',
            width: 170,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, width: '100%' }}>
                    <CodeIcon sx={{ fontSize: 16, color: 'success.main', opacity: 0.7 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                        {params.value != null ? `+${params.value.toLocaleString()}` : '—'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'lineas_cod_eliminadas',
            headerName: 'Líneas Eliminadas',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, width: '100%' }}>
                    <DeleteSweepIcon sx={{ fontSize: 16, color: 'error.main', opacity: 0.7 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.dark' }}>
                        {params.value != null ? `-${params.value.toLocaleString()}` : '—'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'observaciones',
            headerName: 'Observaciones',
            flex: 1,
            minWidth: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Tooltip title={params.value || ''} placement="top">
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{ color: params.value ? 'text.primary' : 'text.disabled', fontStyle: params.value ? 'normal' : 'italic' }}
                    >
                        {params.value || 'Sin observaciones'}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, width: '100%' }}>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(params.row)} color="primary" size="small">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton onClick={() => onDelete(params.row)} color="error" size="small">
                            <DeleteOutlineIcon fontSize="small" />
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
                getRowId={(row) => row.id}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                    sorting: { sortModel: [{ field: 'periodo', sort: 'desc' }] }
                }}
                disableRowSelectionOnClick
                density="compact"
                sx={{
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'action.hover',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'grey.50',
                        fontWeight: 700,
                    },
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            />
        </Box>
    );
};

export default DatosDesarrolloTable;
