import { useState } from "react";
import {
    Box,
    Divider,
    FormControl,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import { RadioFromControl } from "./RadioFromControl";

const SelectControl = ({ label, value, setValue, options }) => (
    <Box sx={{ mb: 2 }}>
        <RadioFromControl heading={label} />
        <FormControl fullWidth>
            <Select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                sx={{
                    height: 44,
                    minWidth: 120,
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "divider",
                    },
                    "&.MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                            borderColor: "divider",
                        },
                    },
                }}
            >
                {options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                        {opt}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </Box>
);

export const RampUp = () => {
    const [timeout, setTimeout] = useState("1000ms(1s)");
    const [rampUp, setRampUp] = useState(1);

    const timeouts = ["500ms(0.5s)", "1000ms(1s)", "2000ms(2s)"];
    const rampUpSteps = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <Box
            sx={{
                maxWidth: "613px",
                bgcolor: "background.paper",
                borderRadius: "16px",
                p: 3,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            }}
        >
            <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
            >
                Ramp Up
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <SelectControl
                label="Request Timeout (ms)"
                value={timeout}
                setValue={setTimeout}
                options={timeouts}
            />

            <SelectControl
                label="RampUp Steps"
                value={rampUp}
                setValue={setRampUp}
                options={rampUpSteps}
            />
        </Box>
    );
};
