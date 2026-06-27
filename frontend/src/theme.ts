import { createTheme } from '@mui/material/styles';

// Web3 dark design system: deep navy canvas, green->teal gradient accents,
// glassmorphism surfaces, and a subtle ambient glow.
const BG = '#0B0F19';
const SURFACE = '#141A2A';
const GREEN = '#22C55E';
const TEAL = '#2DD4BF';
const BORDER = 'rgba(255,255,255,0.08)';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: GREEN },
    secondary: { main: TEAL },
    background: { default: BG, paper: SURFACE },
    text: { primary: '#E6EAF2', secondary: '#94A3B8' },
    divider: BORDER,
    success: { main: GREEN },
    info: { main: '#38BDF8' },
    warning: { main: '#FBBF24' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BG,
          backgroundImage:
            'radial-gradient(at 15% 0%, rgba(34,197,94,0.10), transparent 45%), radial-gradient(at 85% 10%, rgba(45,212,191,0.08), transparent 45%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11,15,25,0.72)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0E1320',
          borderRight: `1px solid ${BORDER}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20,26,41,0.7)',
          backgroundImage: 'none',
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: 'transparent' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, textTransform: 'none', fontWeight: 600 },
        containedPrimary: {
          background: `linear-gradient(135deg, ${GREEN}, ${TEAL})`,
          color: '#06281A',
          '&:hover': { background: 'linear-gradient(135deg, #16A34A, #14B8A6)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: BORDER },
        head: { color: '#94A3B8', fontWeight: 700 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: BORDER },
      },
    },
  },
});
