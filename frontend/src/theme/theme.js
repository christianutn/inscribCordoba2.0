import { createTheme } from '@mui/material/styles';
import { colors } from './colors';
import { typography } from './typography';

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
      CBA_Grey7: colors.CBA_Grey7,
      CBA_Grey8: colors.CBA_Grey8,
      CBA_Grey9: colors.CBA_Grey9,
      CBA_Grey10: colors.CBA_Grey10,
      CBA_Grey11: colors.CBA_Grey11,
    },
  },
  typography: {
    fontFamily: typography.fontFamily,
    h1: {
      fontWeight: typography.fontWeights.bold,
      fontSize: typography.fontSizes.xlarge,
    },
    h2: {
      fontWeight: typography.fontWeights.bold,
      fontSize: typography.fontSizes.large,
    },
    body1: {
      fontWeight: typography.fontWeights.regular,
      fontSize: typography.fontSizes.medium,
    },
    button: {
      fontWeight: typography.fontWeights.bold,
      fontSize: typography.fontSizes.medium,
    },
  },
});

export default theme;
