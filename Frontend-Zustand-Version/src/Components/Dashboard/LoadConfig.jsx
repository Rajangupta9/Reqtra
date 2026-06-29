import React, { useState } from "react";
import {
	Box,
	Typography,
	Radio,
	FormControlLabel,
	Slider,
	Divider,
} from "@mui/material";
import { RadioFromControl } from "./RadioFromControl";

export default function LoadConfiguration() {

	const [noRequest, setNoRequest] = useState(50)
	const [concurrency, setConcurrency] = useState(5)


	function handleNoOfRequest(e) {
		setNoRequest(e.target.value)
	}
	function handleConcurrency(e) {
		setConcurrency(e.target.value)
	}
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
				Load Configuration
			</Typography>

			<Divider sx={{ mb: 3 }} />


			<Box sx={{ mb: 1 }}>
				<RadioFromControl heading={"Number of Request"} />
				<Slider
					defaultValue={50}
					onChange={handleNoOfRequest}
					min={1}
					max={1000}
					step={10}
					aria-label="Number of Requests"
					valueLabelDisplay="auto"
				/>

				<Typography
					variant="body2"
					sx={{ mt: 1, color: "text.secondary" }}
				>
					{noRequest}
				</Typography>
			</Box>

			<Box>
				<RadioFromControl heading={'Concurrency Level'} />

				<Slider
					defaultValue={5}
					onChange={handleConcurrency}
					min={1}
					max={20}
					step={1}
					aria-label="Concurrency Level"
					valueLabelDisplay="auto"
				/>

				<Typography
					variant="body2"
					sx={{ mt: 1, color: "text.secondary" }}
				>
					{concurrency}
				</Typography>
			</Box>
		</Box>
	);
}
