import { Typography } from "@mui/material"






export const HeadingText = (props) => {


    const {text} = props
    return (
        <Typography
            variant="h4"
            sx={{
                fontSize: '28px',
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #FFFFFF 0%, #A9B1BD 100%)'
                    : 'linear-gradient(135deg, #172B4D 0%, #637381 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}
        >
            {text || "Welcome back!"}
        </Typography>
    )
}