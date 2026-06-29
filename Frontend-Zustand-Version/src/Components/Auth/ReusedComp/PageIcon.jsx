import { alpha, Box } from "@mui/material"

export const PageIcon = () => {


    return (
        <Box
            sx={{
                mb: 4,
                p: 2,
                borderRadius: '16px',
                background: (theme) => alpha(theme.palette.primary.main, 0.08),
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
        >
            <img
                src="reqtraIcon.png"
                alt="Logo"
                style={{
                    width: 80,
                    height: 'auto',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
            />
        </Box>
    )
}