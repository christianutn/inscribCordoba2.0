import { createTheme } from '@mui/material/styles';
import { colors } from './colors';
import { typography } from './typography';
import { esES } from '@mui/x-data-grid/locales';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.CBA_Blue,
    },
    secondary: {
      main: colors.CBA_DarkBlue,
    },
    error: {
      main: colors.CBA_Error,
    },
    success: {
      main: colors.CBA_Correct,
    },
    info: {
      main: colors.CBA_Info,
    },
    warning: {
      main: colors.CBA_Alert,
    },
    common: {
      white: colors.white,
      black: colors.black,
    },
    grey: {
      '100': colors.CBA_Grey6,
      '200': colors.CBA_Grey5,
      '300': colors.CBA_Grey4,
      '400': colors.CBA_Grey3,
      '500': colors.CBA_Grey2,
      '600': colors.CBA_Grey1,
    },
    custom: {
      CBA_Blue_Darker: colors.CBA_Blue_Darker,
      CBA_Blue_Dark: colors.CBA_Blue_Dark,
      CBA_Grey7: colors.CBA_Grey7,
      CBA_Grey8: colors.CBA_Grey8,
      CBA_Grey9: colors.CBA_Grey9,
      CBA_Grey10: colors.CBA_Grey10,
      CBA_Grey11: colors.CBA_Grey11,
    },
    background: {
      default: '#ffff',
    },
  },
  typography: {
    fontFamily: typography.fontFamilySecondary, // Fuente por defecto para el cuerpo de texto
    h1: {
      fontFamily: typography.fontFamilyPrimary,
      fontWeight: typography.fontWeights.bold,
      fontSize: typography.fontSizes.xlarge,
    },
    h2: {
      fontFamily: typography.fontFamilyPrimary,
      fontWeight: typography.fontWeights.bold,
      fontSize: typography.fontSizes.large,
    },
    h3: { fontFamily: typography.fontFamilyPrimary, fontWeight: typography.fontWeights.bold },
    h4: { fontFamily: typography.fontFamilyPrimary, fontWeight: typography.fontWeights.bold },
    h5: { fontFamily: typography.fontFamilyPrimary, fontWeight: typography.fontWeights.bold },
    h6: { fontFamily: typography.fontFamilyPrimary, fontWeight: typography.fontWeights.bold },
    subtitle1: { fontFamily: typography.fontFamilyPrimary },
    subtitle2: { fontFamily: typography.fontFamilyPrimary },
    body1: {
      fontFamily: typography.fontFamilySecondary,
      fontWeight: typography.fontWeights.regular,
      fontSize: typography.fontSizes.medium,
    },
    body2: { fontFamily: typography.fontFamilySecondary },
    button: {
      fontFamily: typography.fontFamilySecondary,
      fontWeight: typography.fontWeights.bold,
      fontSize: typography.fontSizes.medium,
      color: colors.CBA_Blue,
    },
  },
  components: {
    // Sobrescribimos los estilos y props por defecto para MuiDataGrid
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
          scrollbarColor: "#CBD5E1 transparent",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "transparent",
            width: '6px',
            height: '6px',
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 10,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            minHeight: 24,
            border: '2px solid transparent', // Crea un efecto de padding dentro del track
            backgroundClip: 'padding-box'
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
        },
        '#root': {
          backgroundColor: '#F8FAFC',
        }
      },
    },
    MuiDataGrid: {
      defaultProps: {
        localeText: esES.components.MuiDataGrid.defaultProps.localeText,
      },
      styleOverrides: {
        // Quitamos la negrita de todas las cabeceras
        columnHeaderTitle: {
          fontWeight: 'normal',
        },
      },
    },
    MuiDatePicker: {
      defaultProps: {
        format: 'DD/MM/YYYY',
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: colors.CBA_Blue,
        },
      },
    },
  },
}, esES); // Pasamos esES también para los componentes core de MUI (ej. DatePicker)

export default theme;
