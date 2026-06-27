import { createTheme } from '@mui/material/styles';

// Ported from the legacy CRA app (green = food/agriculture, orange accent).
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2E7D32' },
    secondary: { main: '#FF6F00' },
    background: { default: '#F8F9FA', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '12px' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '8px', textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});
