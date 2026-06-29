import { Box, FormControlLabel, Radio, Typography } from "@mui/material"





export const RadioFromControl = (props) => {

    const { heading } = props
    return (
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
            <FormControlLabel
                value="concurrencyLevel"
                control={<Radio size="small" />}
                label={
                    <Typography sx={{ fontSize: "14px", color: "text.secondary" }}>
                        {heading}
                    </Typography>
                }
            />
        </Box>
    )
}