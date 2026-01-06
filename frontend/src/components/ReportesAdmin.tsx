import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardActionArea,
    AppBar,
    Toolbar,
    IconButton,
    Container,
    Paper,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Groups as GroupsIcon,
    School as SchoolIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';

const ReportesAdmin = () => {
    const theme = useTheme();
    // We can use useMediaQuery to check for dark mode preference if we wanted strict adherence,
    // but we'll stick to the explicit colors requested or theme defaults where appropriate.
    // The provided HTML sets specific colors, we will use those to match the design.

    const colors = {
        primary: "#0078d4",
        backgroundLight: "#f8f9fa",
        backgroundDark: "#121212",
        surfaceLight: "#ffffff",
        surfaceDark: "#1e1e1e",
        textLight: "#212529",
        textDark: "#e0e0e0",
        textSecondaryLight: "#6c757d",
        textSecondaryDark: "#adb5bd",
        borderLight: "#dee2e6",
        borderDark: "#343a40",
    };

    // Mocking the mode as light for now to match the primary look of the HTML, 
    // or we could check theme.palette.mode. 
    // Assuming Light Mode as default based on the design request usually favoring the light preview unless specified.
    const isDarkMode = theme.palette.mode === 'dark';

    const bgColor = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
    const surfaceColor = isDarkMode ? colors.surfaceDark : colors.surfaceLight;
    const textColor = isDarkMode ? colors.textDark : colors.textLight;
    const secondaryTextColor = isDarkMode ? colors.textSecondaryDark : colors.textSecondaryLight;
    const borderColor = isDarkMode ? colors.borderDark : colors.borderLight;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: bgColor }}>

            {/* Header */}
            <AppBar position="static" sx={{ bgcolor: colors.primary, boxShadow: 3, flexShrink: 0 }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: '64px' }}>
                    <Typography variant="h6" component="div" fontWeight="bold">
                        InscribCórdoba
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Hola, Administrador [ADM]
                        </Typography>
                        <IconButton
                            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                            href="#"
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
                <Container maxWidth="xl">

                    {/* Welcome/Title Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 4,
                            bgcolor: surfaceColor,
                            borderRadius: 2,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            color: textColor
                        }}
                    >
                        <Typography variant="h5" component="h1" fontWeight="bold">
                            Selección de Reportes Administrativos
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1, color: secondaryTextColor }}>
                            Seleccione una categoría para visualizar el reporte detallado.
                        </Typography>
                    </Paper>

                    {/* Cards Grid */}
                    <Grid container spacing={4}>

                        {/* Card 1: Resumen Cursos */}
                        <Grid item xs={12} md={6} lg={4}>
                            <Card
                                sx={{
                                    bgcolor: surfaceColor,
                                    borderRadius: 2,
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: 8,
                                        transform: 'translateY(-4px)'
                                    }
                                }}
                            >
                                <CardActionArea sx={{ p: 3, height: '100%' }} href="#">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: isDarkMode ? 'rgba(30, 64, 175, 0.3)' : '#dbeafe', // blue-100 / blue-900/30
                                                color: isDarkMode ? '#60a5fa' : '#2563eb', // blue-600 / blue-400
                                                width: 56,
                                                height: 56
                                            }}
                                        >
                                            <TrendingUpIcon />
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: textColor }}>
                                            Resumen Cursos CC y CVE
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>

                        {/* Card 2: Desempeño del Equipo */}
                        <Grid item xs={12} md={6} lg={4}>
                            <Card
                                sx={{
                                    bgcolor: surfaceColor,
                                    borderRadius: 2,
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: 8,
                                        transform: 'translateY(-4px)'
                                    }
                                }}
                            >
                                <CardActionArea sx={{ p: 3, height: '100%' }} href="#">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: isDarkMode ? 'rgba(20, 83, 45, 0.3)' : '#dcfce7', // green-100
                                                color: isDarkMode ? '#4ade80' : '#16a34a', // green-600
                                                width: 56,
                                                height: 56
                                            }}
                                        >
                                            <GroupsIcon />
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: textColor }}>
                                            Desempeño del Equipo
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>

                        {/* Card 3: Cursos Autogestionados */}
                        <Grid item xs={12} md={6} lg={4}>
                            <Card
                                sx={{
                                    bgcolor: surfaceColor,
                                    borderRadius: 2,
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: 8,
                                        transform: 'translateY(-4px)'
                                    }
                                }}
                            >
                                <CardActionArea sx={{ p: 3, height: '100%' }} href="#">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: isDarkMode ? 'rgba(88, 28, 135, 0.3)' : '#f3e8ff', // purple-100
                                                color: isDarkMode ? '#c084fc' : '#9333ea', // purple-600
                                                width: 56,
                                                height: 56
                                            }}
                                        >
                                            <SchoolIcon />
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: textColor }}>
                                            Cursos Autogestionados
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>

                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default ReportesAdmin;
