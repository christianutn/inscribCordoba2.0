import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const CursosTable = ({ data, onEdit }) => {
    const columns = [
        { field: 'cod', headerName: 'Código', width: 100 },
        { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 200 },
        { field: 'cupo', headerName: 'Cupo', width: 80, type: 'number' },
        {
            field: 'plataformaDictado',
            headerName: 'Plataforma',
            width: 150,
            valueGetter: (value, row) => row.detalle_plataformaDictado?.nombre || 'N/A'
        },
        {
            field: 'medioInscripcion',
            headerName: 'Medio Inscripción',
            width: 150,
            valueGetter: (value, row) => row.detalle_medioInscripcion?.nombre || 'N/A'
        },
        {
            field: 'tipoCapacitacion',
            headerName: 'Tipo Capacitación',
            width: 150,
            valueGetter: (value, row) => row.detalle_tipoCapacitacion?.nombre || 'N/A'
        },
        { field: 'cantidad_horas', headerName: 'Horas', width: 80, type: 'number' },
        {
            field: 'area',
            headerName: 'Área',
            width: 150,
            valueGetter: (value, row) => row.detalle_area?.nombre || 'N/A'
        },
        {
            field: 'ministerio',
            headerName: 'Ministerio',
            width: 150,
            valueGetter: (value, row) => row.detalle_area?.detalle_ministerio?.nombre || 'N/A'
        },
        {
            field: 'esVigente',
            headerName: 'Vigente',
            width: 100,
            valueGetter: (value, row) => row.esVigente ? 'Sí' : 'No'
        },
        {
            field: 'tiene_evento_creado',
            headerName: 'Evento Creado',
            width: 120,
            valueGetter: (value, row) => row.tiene_evento_creado ? 'Sí' : 'No'
        },
        {
            field: 'esta_autorizado',
            headerName: 'Autorizado',
            width: 100,
            valueGetter: (value, row) => row.esta_autorizado ? 'Sí' : 'No'
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

export default CursosTable;
