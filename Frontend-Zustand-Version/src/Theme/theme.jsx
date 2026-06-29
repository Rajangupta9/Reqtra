import { createTheme } from "@mui/material";
import { alpha } from '@mui/material/styles';

export const getDesignTokens = (mode) => {
    const darkPalette = {
        primary: {
            main: '#0D6EFD',
            dark: '#0B5ED7',
            light: '#3D8BFF',
        },
        background: {
            default: '#000000ff',
            paper: '#000f25ff',
            popover: '#1c1c31ff'
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#A9B1BD',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
        folder: '#FFA726',
        selected: "#bfc1c2ff"
    };

    const lightPalette = {
        primary: {
            main: '#0D6EFD',
            dark: '#0B5ED7',
            light: '#3D8BFF',
        },
        background: {
            default: '#f4f4f5ff',
            paper: '#FFFFFF',
            popover: '#edeef0ff'

        },
        text: {
            primary: '#172B4D',
            secondary: '#637381',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
        folder: '#000000',
        selected: "#0B5ED7"
    };

    return createTheme({
        palette: {
            mode,
            ...(mode === 'light' ? lightPalette : darkPalette),
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h4: {
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: "12px",
        },
        components: {
            MuiDrawer: {
                styleOverrides: {
                    paper: ({ theme }) => ({
                        backgroundColor: theme.palette.background.paper,
                        borderRight: 'none',
                    }),
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        boxShadow: 'none',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }),
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: 12,
                        color: theme.palette.text.secondary,
                        transition: 'all 0.2s ease-in-out',
                        '& .MuiListItemIcon-root': {
                            color: 'inherit',
                        },
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                        '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                            },
                        },
                    }),
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        borderRadius: '12px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease-in-out',
                    },
                    contained: ({ theme }) => ({
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.25)}`,
                        '&:hover': {
                            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.3)}`,
                        },
                    }),
                    outlined: ({ theme }) => ({
                        borderWidth: '1.5px',
                        '&:hover': {
                            borderWidth: '1.5px',
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                    }),
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: ({ theme }) => ({


                        '& .MuiOutlinedInput-root': {
                            borderRadius: '4px',
                            transition: 'all 0.2s ease-in-out',
                            '& fieldset': {
                                borderWidth: '1.5px',
                                borderColor: alpha(theme.palette.divider, 0.3),
                            },
                            '&:hover fieldset': {
                                borderColor: alpha(theme.palette.primary.main, 0.5),
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.main,

                            },
                        },
                    }),
                },
            },
            MuiCheckbox: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: '4px',
                        color: theme.palette.text.secondary,
                        '&.Mui-checked': {
                            color: theme.palette.primary.main,
                        },
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                    }),
                },
            },
            MuiContainer: {
                styleOverrides: {
                    root: {
                        '@media (min-width: 600px)': {
                            paddingLeft: '24px',
                            paddingRight: '24px',
                        },
                    },
                },
            },
            MuiTypography: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        '&.gradient-text': {
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #FFFFFF 0%, #A9B1BD 100%)'
                                : 'linear-gradient(135deg, #172B4D 0%, #637381 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        },
                    }),
                },
            },
            MuiFormControlLabel: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        marginLeft: 0,
                        '& .MuiFormControlLabel-label': {
                            fontSize: '14px',
                            color: theme.palette.text.secondary,
                        },
                    }),
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        borderRadius: '16px',
                    },
                    elevation1: ({ theme }) => ({
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    }),
                    elevation3: ({ theme }) => ({
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                            : '0 4px 20px rgba(0, 0, 0, 0.1)',
                    }),
                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        // height: 44,
                        // '& .MuiSelect-select': {
                        //     backgroundColor: 'inherit',
                        //     '&:hover': {
                        //         backgroundColor: 'inherit',
                        //     },
                        // },
                    },
                },
            },

            MuiOutlinedInput: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: alpha(theme.palette.background.default, 0.5),

                    }),
                },
            },

            MuiMenuItem: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        '&:hover': {
                            backgroundColor: 'inherit',
                        },
                        '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                            },
                        },
                    }),
                },
            },



            MuiInputBase: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        px: 1,
                        py: 0.5,
                        borderRadius: "4px",
                        border: "1px solid transparent",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            border: "1px solid",
                            borderColor: theme.palette.divider,     
                            backgroundColor: alpha(theme.palette.background.default, 1),
                        },
                        "&.Mui-focused": {
                            border: "1px solid",
                            borderColor: alpha(theme.palette.divider, 0.3),
                            backgroundColor: alpha(theme.palette.background.default, 1),
                        },
                    }),
                },
            }


        },
    });
};