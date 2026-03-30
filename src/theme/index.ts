import { alpha, createTheme, type PaletteMode } from '@mui/material/styles'

export const createAppTheme = (mode: PaletteMode, fontSize: number) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#F5A623',
        light: '#FFC65C',
        dark: '#D78609',
        contrastText: '#111111',
      },
      background: {
        default: mode === 'dark' ? '#0D0D0D' : '#FAFAFA',
        paper: mode === 'dark' ? '#1C1C1C' : '#FFFFFF',
      },
      text: {
        primary: mode === 'dark' ? '#F7F5F2' : '#171717',
        secondary: mode === 'dark' ? '#A5A5A5' : '#666666',
      },
      divider: mode === 'dark' ? alpha('#FFFFFF', 0.08) : alpha('#121212', 0.08),
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      fontSize,
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease',
            backgroundImage:
              mode === 'dark'
                ? 'radial-gradient(circle at top, rgba(245,166,35,0.14), transparent 38%)'
                : 'radial-gradient(circle at top, rgba(245,166,35,0.16), transparent 34%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingInline: 18,
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: '0 20px 40px rgba(245,166,35,0.28)',
          },
        },
      },
    },
  })
