import React from 'react';
import {
    Grid, TextField, FormControl, InputLabel, Select, MenuItem,
    InputAdornment, Tooltip, Button, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { MONTH_NAMES } from './constants';

const FilterBar = ({
    filters,
    setFilters,
    ministerioOptions,
    areaOptions,
    handleClearFilters,
    isFilterActive,
    loading
}) => {
    const { ministerioFilter, areaFilter, nombreFilter, monthFilter, activosFilterActive, asignadoFilter } = filters;
    const { setMinisterioFilter, setAreaFilter, setNombreFilter, setMonthFilter, setActivosFilterActive, setAsignadoFilter } = setFilters;

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2.5}>
                    <TextField fullWidth label="Buscar por Asignado" variant="outlined" size="small" value={asignadoFilter} onChange={(e) => setAsignadoFilter(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><AssignmentIndIcon color="action" fontSize="small" /></InputAdornment>), }} />
                </Grid>
                <Grid item xs={12} sm={6} md={2.5}>
                    <TextField fullWidth label="Buscar por Nombre/Código" variant="outlined" size="small" value={nombreFilter} onChange={(e) => setNombreFilter(e.target.value)} disabled={loading} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), }} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small" variant="outlined" disabled={loading || ministerioOptions.length <= 1}>
                        <InputLabel id="adm-filter-label">ADM (Ministerio)</InputLabel>
                        <Select labelId="adm-filter-label" value={ministerioFilter} label="ADM (Ministerio)" onChange={(e) => setMinisterioFilter(e.target.value)} startAdornment={<InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><AccountBalanceIcon color="action" fontSize='small' /></InputAdornment>} sx={{ '& .MuiSelect-select': { pl: 1 } }} >
                            <MenuItem value="all"><em>Todos</em></MenuItem>
                            {ministerioOptions.filter(opt => opt !== 'all').map((opt, i) => (<MenuItem key={i} value={opt}>{opt}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small" variant="outlined" disabled={loading || ministerioFilter === 'all' || areaOptions.length <= 1}>
                        <InputLabel id="area-filter-label">Área</InputLabel>
                        <Select labelId="area-filter-label" value={areaFilter} label="Área" onChange={(e) => setAreaFilter(e.target.value)} startAdornment={<InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><FolderSpecialIcon color="action" fontSize='small' /></InputAdornment>} sx={{ '& .MuiSelect-select': { pl: 1 } }}>
                            <MenuItem value="all"><em>Todas</em></MenuItem>
                            {areaOptions.filter(opt => opt !== 'all').map((opt, i) => (<MenuItem key={i} value={opt}>{opt}</MenuItem>))}
                            {ministerioFilter !== 'all' && areaOptions.length <= 1 && (<MenuItem value="all" disabled><em>(Sin áreas)</em></MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small" variant="outlined" disabled={loading}>
                        <InputLabel id="mes-filter-label">Mes Inicio Curso</InputLabel>
                        <Select labelId="mes-filter-label" value={monthFilter} label="Mes Inicio Curso" onChange={(e) => setMonthFilter(e.target.value)} startAdornment={<InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><CalendarMonthIcon color="action" fontSize='small' /></InputAdornment>} sx={{ '& .MuiSelect-select': { pl: 1 } }}>
                            <MenuItem value="all"><em>Todos</em></MenuItem>
                            {MONTH_NAMES.map((m, i) => (<MenuItem key={i} value={i.toString()}>{m}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}>
                    <Tooltip title={activosFilterActive ? "Mostrar todos los cursos" : "Mostrar solo cursos activos ahora"}>
                        <Button fullWidth variant={activosFilterActive ? "contained" : "outlined"} size="medium" onClick={() => setActivosFilterActive(prev => !prev)} disabled={loading} startIcon={<AccessTimeIcon />} sx={{ height: '40px', minWidth: 'auto' }}>Activos</Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}>
                    <Button fullWidth variant="outlined" size="medium" onClick={handleClearFilters} disabled={!isFilterActive || loading} startIcon={<ClearAllIcon />} sx={{ height: '40px', minWidth: 'auto' }}>Limpiar</Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default FilterBar;
