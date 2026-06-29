import { createTheme } from "@mui/material";
import { alpha } from '@mui/material/styles';

export const getDesignTokens = (mode) => {
    const isDark = mode === 'dark';

    const darkPalette = {
        primary: {
            main: '#4F8EF7',
            dark: '#3A7CE0',
            light: '#79AEFF',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#8B5CF6',
            dark: '#7C3AED',
            light: '#A78BFA',
            contrastText: '#FFFFFF',
        },
        success: {
            main: '#3FB950',
            dark: '#2EA043',
            light: '#56D364',
            contrastText: '#FFFFFF',
        },
        warning: {
            main: '#D29922',
            dark: '#BB8009',
            light: '#E3B341',
            contrastText: '#161B22',
        },
        error: {
            main: '#F85149',
            dark: '#DA3633',
            light: '#FF7B72',
            contrastText: '#FFFFFF',
        },
        info: {
            main: '#58A6FF',
            dark: '#4493E6',
            light: '#79C0FF',
            contrastText: '#0D1117',
        },
        background: {
            default: '#0D1117',
            paper: '#161B22',
            elevated: '#21262D',
            popover: '#21262D',
        },
        text: {
            primary: '#E6EDF3',
            secondary: '#8B949E',
            disabled: '#484F58',
        },
        divider: '#21262D',
        action: {
            hover: 'rgba(177,186,196,0.06)',
            selected: 'rgba(177,186,196,0.10)',
            focus: 'rgba(177,186,196,0.08)',
            disabled: '#484F58',
            disabledBackground: 'rgba(177,186,196,0.04)',
        },
        folder: '#8B949E',
        selected: '#4F8EF7',
    };

    const lightPalette = {
        primary: {
            main: '#0969DA',
            dark: '#0550AE',
            light: '#388BFD',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#7C3AED',
            dark: '#6D28D9',
            light: '#8B5CF6',
            contrastText: '#FFFFFF',
        },
        success: {
            main: '#1A7F37',
            dark: '#116329',
            light: '#2DA44E',
            contrastText: '#FFFFFF',
        },
        warning: {
            main: '#9A6700',
            dark: '#7D4E00',
            light: '#BF8700',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#CF222E',
            dark: '#A40E26',
            light: '#FA4549',
            contrastText: '#FFFFFF',
        },
        info: {
            main: '#0969DA',
            dark: '#0550AE',
            light: '#388BFD',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#F6F8FA',
            paper: '#FFFFFF',
            elevated: '#F1F4F8',
            popover: '#F6F8FA',
        },
        text: {
            primary: '#24292F',
            secondary: '#57606A',
            disabled: '#8C959F',
        },
        divider: '#D0D7DE',
        action: {
            hover: 'rgba(0,0,0,0.04)',
            selected: 'rgba(0,0,0,0.06)',
            focus: 'rgba(0,0,0,0.04)',
            disabled: '#8C959F',
            disabledBackground: 'rgba(0,0,0,0.04)',
        },
        folder: '#57606A',
        selected: '#0969DA',
    };

    return createTheme({
        palette: {
            mode,
            ...(isDark ? darkPalette : lightPalette),
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
            h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
            h3: { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 },
            h4: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
            h5: { fontWeight: 600, lineHeight: 1.4 },
            h6: { fontWeight: 600, fontSize: '15px', lineHeight: 1.4 },
            body1: { fontSize: '14px', lineHeight: 1.6 },
            body2: { fontSize: '13px', lineHeight: 1.5 },
            caption: { fontSize: '12px', lineHeight: 1.4, letterSpacing: '0.01em' },
            subtitle1: { fontSize: '14px', fontWeight: 500, lineHeight: 1.5 },
            subtitle2: { fontSize: '12px', fontWeight: 500, lineHeight: 1.4 },
            button: { fontWeight: 500, letterSpacing: '0.01em', fontSize: '13px' },
            overline: { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' },
        },
        shape: { borderRadius: 6 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { fontFeatureSettings: '"cv02","cv03","cv04","cv11"' },
                    '::-webkit-scrollbar': { width: '6px', height: '6px' },
                    '::-webkit-scrollbar-track': { background: 'transparent' },
                    '::-webkit-scrollbar-thumb': {
                        backgroundColor: isDark ? 'rgba(177,186,196,0.18)' : 'rgba(0,0,0,0.18)',
                        borderRadius: '10px',
                    },
                    '::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: isDark ? 'rgba(177,186,196,0.32)' : 'rgba(0,0,0,0.28)',
                    },
                    '*': {
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark
                            ? 'rgba(177,186,196,0.18) transparent'
                            : 'rgba(0,0,0,0.18) transparent',
                    },
                },
            },

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

            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '13px',
                        letterSpacing: '0.01em',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                        lineHeight: 1,
                    },
                    contained: ({ theme }) => ({
                        backgroundColor: theme.palette.primary.main,
                        color: '#FFFFFF',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                            boxShadow: 'none',
                        },
                        '&:active': { transform: 'scale(0.98)' },
                        '&.Mui-disabled': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.25),
                            color: alpha('#FFFFFF', 0.4),
                        },
                    }),
                    outlined: ({ theme }) => ({
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.secondary,
                        backgroundColor: 'transparent',
                        borderWidth: '1px',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            borderColor: isDark ? '#30363D' : '#B0BAC4',
                            color: theme.palette.text.primary,
                        },
                    }),
                    text: ({ theme }) => ({
                        color: theme.palette.text.secondary,
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.text.primary,
                        },
                    }),
                    sizeSmall: { fontSize: '12px', padding: '5px 10px' },
                },
            },

            MuiIconButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: '6px',
                        color: theme.palette.text.secondary,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.text.primary,
                        },
                    }),
                    sizeSmall: { padding: '4px' },
                },
            },

            MuiTabs: {
                styleOverrides: {
                    indicator: ({ theme }) => ({
                        height: 2,
                        borderRadius: '2px 2px 0 0',
                        backgroundColor: theme.palette.primary.main,
                    }),
                    scrollButtons: {
                        '&.Mui-disabled': { opacity: 0.2 },
                    },
                },
            },

            MuiTab: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '13px',
                        color: theme.palette.text.secondary,
                        minHeight: 40,
                        padding: '8px 14px',
                        transition: 'color 0.15s ease',
                        '&.Mui-selected': { color: theme.palette.text.primary },
                        '&:hover': { color: theme.palette.text.primary },
                    }),
                },
            },

            MuiTextField: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                            fontSize: '13px',
                            backgroundColor: isDark ? alpha('#000', 0.25) : '#FFFFFF',
                            transition: 'box-shadow 0.15s ease',
                            '& fieldset': {
                                borderColor: theme.palette.divider,
                                borderWidth: '1px',
                                transition: 'border-color 0.15s ease',
                            },
                            '&:hover fieldset': {
                                borderColor: isDark ? '#30363D' : '#B0BAC4',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: '1.5px',
                            },
                            '&.Mui-focused': {
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                            },
                            '& .MuiOutlinedInput-input': {
                                color: theme.palette.text.primary,
                                '&::placeholder': {
                                    color: theme.palette.text.disabled,
                                    opacity: 1,
                                },
                            },
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '13px',
                            color: theme.palette.text.secondary,
                            '&.Mui-focused': { color: theme.palette.primary.main },
                        },
                        '& .MuiFormHelperText-root': {
                            fontSize: '11px',
                            marginTop: '4px',
                        },
                    }),
                },
            },

            MuiOutlinedInput: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: '6px',
                        fontSize: '13px',
                        backgroundColor: isDark ? alpha('#000', 0.25) : '#FFFFFF',
                        '& fieldset': {
                            borderColor: theme.palette.divider,
                            borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                            borderColor: isDark ? '#30363D' : '#B0BAC4',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: '1.5px',
                        },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                        },
                        '& .MuiOutlinedInput-input': {
                            color: theme.palette.text.primary,
                            '&::placeholder': {
                                color: theme.palette.text.disabled,
                                opacity: 1,
                            },
                        },
                    }),
                },
            },

            MuiInputBase: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        fontSize: '13px',
                        color: theme.palette.text.primary,
                    }),
                    input: ({ theme }) => ({
                        '&::placeholder': {
                            color: theme.palette.text.disabled,
                            opacity: 1,
                        },
                    }),
                },
            },

            MuiSelect: {
                styleOverrides: {
                    select: { fontSize: '13px' },
                },
            },

            MuiMenuItem: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        fontSize: '13px',
                        borderRadius: '4px',
                        margin: '1px 4px',
                        padding: '6px 10px',
                        transition: 'background-color 0.1s ease',
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                        '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08),
                            color: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
                            },
                        },
                    }),
                },
            },

            MuiListItemButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: 6,
                        padding: '6px 10px',
                        color: theme.palette.text.secondary,
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                        '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 32 },
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.text.primary,
                        },
                        '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08),
                            color: theme.palette.primary.main,
                            '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
                            },
                        },
                    }),
                },
            },

            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'none' },
                    rounded: { borderRadius: '8px' },
                    elevation0: { boxShadow: 'none' },
                    elevation1: {
                        boxShadow: isDark
                            ? '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)'
                            : '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
                    },
                    elevation2: {
                        boxShadow: isDark
                            ? '0 4px 16px rgba(0,0,0,0.55)'
                            : '0 4px 16px rgba(0,0,0,0.08)',
                    },
                    elevation3: {
                        boxShadow: isDark
                            ? '0 8px 32px rgba(0,0,0,0.65)'
                            : '0 8px 32px rgba(0,0,0,0.1)',
                    },
                },
            },

            MuiCard: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundImage: 'none',
                        borderRadius: '8px',
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: 'none',
                    }),
                },
            },

            MuiCardContent: {
                styleOverrides: {
                    root: {
                        padding: '16px',
                        '&:last-child': { paddingBottom: '16px' },
                    },
                },
            },

            MuiCheckbox: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        padding: '4px',
                        color: theme.palette.text.disabled,
                        borderRadius: '4px',
                        '&.Mui-checked': { color: theme.palette.primary.main },
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.06),
                        },
                    }),
                },
            },

            MuiSwitch: {
                styleOverrides: {
                    root: { padding: 6 },
                    thumb: { boxShadow: 'none', width: 14, height: 14 },
                    track: ({ theme }) => ({
                        borderRadius: 10,
                        backgroundColor: isDark ? '#30363D' : '#D0D7DE',
                        opacity: 1,
                        transition: 'background-color 0.15s ease',
                    }),
                    switchBase: ({ theme }) => ({
                        padding: 9,
                        '&.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: theme.palette.primary.main,
                            opacity: 1,
                        },
                    }),
                },
            },

            MuiChip: {
                styleOverrides: {
                    root: {
                        fontSize: '11px',
                        fontWeight: 500,
                        borderRadius: '4px',
                    },
                    sizeSmall: { height: 20 },
                    labelSmall: { padding: '0 6px' },
                    label: { padding: '0 8px' },
                },
            },

            MuiTooltip: {
                defaultProps: { enterDelay: 500, enterNextDelay: 250 },
                styleOverrides: {
                    tooltip: {
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: isDark ? '#30363D' : '#24292F',
                        color: '#E6EDF3',
                        borderRadius: '5px',
                        padding: '5px 9px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    },
                    arrow: { color: isDark ? '#30363D' : '#24292F' },
                },
            },

            MuiAlert: {
                styleOverrides: {
                    root: { borderRadius: '6px', fontSize: '13px' },
                    standardInfo: ({ theme }) => ({
                        backgroundColor: alpha(theme.palette.info.main, isDark ? 0.08 : 0.05),
                        color: isDark ? theme.palette.info.light : theme.palette.info.dark,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        '& .MuiAlert-icon': { color: theme.palette.info.main },
                    }),
                    standardSuccess: ({ theme }) => ({
                        backgroundColor: alpha(theme.palette.success.main, isDark ? 0.08 : 0.05),
                        color: isDark ? theme.palette.success.light : theme.palette.success.dark,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        '& .MuiAlert-icon': { color: theme.palette.success.main },
                    }),
                    standardWarning: ({ theme }) => ({
                        backgroundColor: alpha(theme.palette.warning.main, isDark ? 0.08 : 0.05),
                        color: isDark ? theme.palette.warning.light : theme.palette.warning.dark,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        '& .MuiAlert-icon': { color: theme.palette.warning.main },
                    }),
                    standardError: ({ theme }) => ({
                        backgroundColor: alpha(theme.palette.error.main, isDark ? 0.08 : 0.05),
                        color: isDark ? theme.palette.error.light : theme.palette.error.dark,
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        '& .MuiAlert-icon': { color: theme.palette.error.main },
                    }),
                },
            },

            MuiTableHead: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        '& .MuiTableCell-root': {
                            backgroundColor: isDark ? '#0D1117' : '#F6F8FA',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            fontWeight: 600,
                            fontSize: '11px',
                            color: theme.palette.text.secondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '7px 12px',
                        },
                    }),
                },
            },

            MuiTableCell: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        padding: '7px 12px',
                        fontSize: '13px',
                        color: theme.palette.text.primary,
                    }),
                },
            },

            MuiTableRow: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        transition: 'background-color 0.1s ease',
                        '&:last-child td': { borderBottom: 0 },
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                    }),
                },
            },

            MuiDialog: {
                styleOverrides: {
                    paper: ({ theme }) => ({
                        borderRadius: '10px',
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundImage: 'none',
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: isDark
                            ? '0 24px 64px rgba(0,0,0,0.8)'
                            : '0 24px 64px rgba(0,0,0,0.14)',
                    }),
                },
            },

            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        fontSize: '15px',
                        fontWeight: 600,
                        padding: '16px 20px 12px',
                    },
                },
            },

            MuiDialogContent: {
                styleOverrides: { root: { padding: '8px 20px 16px' } },
            },

            MuiDialogActions: {
                styleOverrides: { root: { padding: '12px 20px' } },
            },

            MuiFormControlLabel: {
                styleOverrides: {
                    root: {
                        marginLeft: 0,
                    },
                    label: ({ theme }) => ({
                        fontSize: '13px',
                        color: theme.palette.text.primary,
                    }),
                },
            },

            MuiDivider: {
                styleOverrides: {
                    root: ({ theme }) => ({ borderColor: theme.palette.divider }),
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
                            background: isDark
                                ? 'linear-gradient(135deg, #E6EDF3 0%, #8B949E 100%)'
                                : 'linear-gradient(135deg, #24292F 0%, #57606A 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        },
                    }),
                },
            },
        },
    });
};
