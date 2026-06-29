import React, { useState } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import { ExpandMore, Code, PlayArrow } from '@mui/icons-material';

const ScriptsTab = () => {
    const [preRequestScript, setPreRequestScript] = useState('');
    const [postResponseScript, setPostResponseScript] = useState('');

    const preRequestTemplate = `// Pre-request script
// This script will run before the request is sent

// Example: Set dynamic variables
pm.globals.set("timestamp", Date.now());

// Example: Generate random data
pm.globals.set("randomId", Math.floor(Math.random() * 1000));

console.log('Pre-request script executed');`;

    const postResponseTemplate = `// Post-response script
// This script will run after the response is received

// Example: Test response status
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Example: Parse and use response data
const responseJson = pm.response.json();
pm.globals.set("userId", responseJson.id);

// Example: Log response data
console.log('Response data:', responseJson);`;

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '16px', fontWeight: 600 }}>
                Scripts
            </Typography>

            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 2 }}>
                <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                            icon={<Code />}
                            label="JavaScript"
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                        <Chip
                            label="Postman API Available"
                            size="small"
                            color="info"
                            variant="outlined"
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Write JavaScript code to run before and after your request. Use the Postman API to set variables, run tests, and more.
                    </Typography>
                </CardContent>
            </Card>

            {/* Pre-request Script */}
            <Accordion
                elevation={0}
                sx={{
                    // border: '1px solid #e0e0e0', 
                    mb: 2,
                    '&:before': { display: 'none' }
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                        // borderBottom: '1px solid #e0e0e0',
                        '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            gap: 1
                        }
                    }}
                >
                    <PlayArrow fontSize="small" color="primary" />
                    <Typography sx={{ fontWeight: 600 }}>Pre-request Script</Typography>
                    <Chip label="Runs before request" size="small" variant="outlined" />
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <TextField
                        value={preRequestScript}
                        onChange={(e) => setPreRequestScript(e.target.value)}
                        placeholder={preRequestTemplate}
                        multiline
                        rows={8}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 0,
                                '& fieldset': { border: 'none' }
                            },
                            '& .MuiInputBase-input': {
                                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                fontSize: '13px',
                                lineHeight: 1.6,

                            }
                        }}
                    />
                </AccordionDetails>
            </Accordion>

          
            <Accordion
                elevation={0}
                sx={{
                    
                    '&:before': { display: 'none' }
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{

                       
                        '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            gap: 1
                        }
                    }}
                >
                    <PlayArrow fontSize="small" color="secondary" />
                    <Typography sx={{ fontWeight: 600 }}>Post-response Script</Typography>
                    <Chip label="Runs after response" size="small" variant="outlined" />
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <TextField
                        value={postResponseScript}
                        onChange={(e) => setPostResponseScript(e.target.value)}
                        placeholder={postResponseTemplate}
                        multiline
                        rows={8}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 0,
                                '& fieldset': { border: 'none' }
                            },
                            '& .MuiInputBase-input': {
                                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                fontSize: '13px',
                                lineHeight: 1.6,

                            }
                        }}
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default ScriptsTab;