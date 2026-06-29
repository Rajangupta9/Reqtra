import {
    Box, Button, Checkbox, FormControlLabel,
    Radio, RadioGroup, Tab, Tabs, TextField, Tooltip,
    Typography, Accordion, AccordionSummary, AccordionDetails,
    InputAdornment
} from '@mui/material';
import React, { useEffect } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CsvUploader from './CsvFileUploader';
import { useApp } from '../../../ContextApi/AppContext';


const AdvancedSettingItem = ({ label, tooltip, defaultChecked = true }) => (
    <FormControlLabel
        control={<Checkbox defaultChecked={defaultChecked} />}
        label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">{label}</Typography>
                <Tooltip title={tooltip}>
                    <InfoOutlinedIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
                </Tooltip>
            </Box>
        }
    />
);

export const RunnerConfig = (props) => {
    const { requests} = props;

    const {activeTabData , addRunnerResponse , setRunnerIterations , setRunnerDelay} = useApp();


    const delay = activeTabData?.delay || 0;
    const iterations = activeTabData?.iterations || 0;

    


    const [tabValue, setTabValue] = React.useState(0);
    const handleTabChange = (event, newValue) => setTabValue(newValue);

    const totalRows = activeTabData?.fileData?.reduce((acc, file) => acc + (file.data?.length || 0), 0) || 0;



    const addTestResultTab = () => {

        addRunnerResponse(activeTabData, activeTabData.flattenrequests);
    };

    if(!activeTabData){
        return null;
    }

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 3, pt: 1.6, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Functional" sx={{ textTransform: 'none' }} />
                    <Tab label="Performance" sx={{ textTransform: 'none' }} />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
                {tabValue === 0 && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 1.5 }}>
                            Choose how to run your collection
                        </Typography>
                        <RadioGroup defaultValue="manual">
                            <Box>
                                <FormControlLabel value="manual" control={<Radio />} label="Run manually" />
                                <Typography variant="body2" sx={{ color: 'text.secondary', pl: 4, mt: -1 }}>
                                    Run this collection in the Collection Runner.
                                </Typography>
                            </Box>
                            <Box sx={{ mt: 1.5 }}>
                                <FormControlLabel value="schedule" control={<Radio disabled />} label="Schedule runs" />
                                <Typography variant="body2" sx={{ color: 'text.secondary', pl: 4, mt: -1 }}>
                                    Periodically run collection at a specified time on the Postman Cloud.
                                </Typography>
                            </Box>
                            <Box sx={{ mt: 1.5 }}>
                                <FormControlLabel value="cli" control={<Radio disabled />} label="Automate runs via CLI" />
                                <Typography variant="body2" sx={{ color: 'text.secondary', pl: 4, mt: -1 }}>
                                    Configure CLI command to run on your build pipeline.
                                </Typography>
                            </Box>
                        </RadioGroup>

                        <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>
                            Run configuration
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ minWidth: '80px' }}>Iterations</Typography>
                            <Tooltip title="Number of times the collection will be run.">
                                <InfoOutlinedIcon />
                            </Tooltip>
                            <TextField
                                size="small"
                                value={iterations}
                                onChange={(e) => setRunnerIterations(activeTabData.id , e.target.value)}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ minWidth: '80px' }}>Delay</Typography>
                            <Tooltip title="Time in milliseconds to wait between requests.">
                                <InfoOutlinedIcon />
                            </Tooltip>
                            <TextField
                                size="small"
                                value={delay}
                                onChange={(e) => setRunnerDelay(activeTabData.id , e.target.value)}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">ms</InputAdornment>
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ minWidth: '80px' }}>Test data file</Typography>
                            <Tooltip title="A JSON or CSV file to use as a data source for variables.">
                                <InfoOutlinedIcon />
                            </Tooltip>
                            <CsvUploader
                                
                            />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, ml: '96px' }}>
                            Only JSON and CSV files are accepted.
                        </Typography>

                        <Accordion sx={{ mt: 3 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">Advanced settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <AdvancedSettingItem
                                        label="Persist responses for a session"
                                        tooltip="Save responses for this session to review them later."
                                    />
                                    <AdvancedSettingItem
                                        label="Turn off logs during run"
                                        tooltip="Disabling logs can improve performance for large runs."
                                    />
                                    <AdvancedSettingItem
                                        label="Stop run if an error occurs"
                                        tooltip="The collection run will stop if any request encounters an error."
                                    />
                                    <AdvancedSettingItem
                                        label="Keep variable values"
                                        tooltip="Persist variables updated during the run."
                                    />
                                    <AdvancedSettingItem
                                        label="Run collection without using stored cookies"
                                        tooltip="Cookies stored in the cookie jar will not be used."
                                        defaultChecked={false}
                                    />
                                    <AdvancedSettingItem
                                        label="Save cookies after collection run"
                                        tooltip="Cookies will be saved to the cookie jar after the run is complete."
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Button variant="contained" onClick={addTestResultTab} color="primary" sx={{ mt: 3 }}>
                            Run
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};