import React, { useState, useRef } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Box,
    Stack,
    TextField,
    Typography,
    Alert,
    Chip,
    Paper
} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAppStore } from "../../../Store/useAppStore";

export default function CsvUploader() {


    const getActiveTabData = useAppStore(state => state.activeTabData); 
    const setRunnerFileData = useAppStore(state => state.setRunnerFileData);
    const setRunnerIterations = useAppStore(state => state.setRunnerIterations);

    const activeTabData = getActiveTabData(); 

    
    const filesData = activeTabData?.fileData || [];

    const [previewData, setPreviewData] = useState(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);


    const parseCSV = (text) => {
        const lines = text.trim().split("\n");
        if (lines.length === 0) return { headers: [], data: [] };


        const parseLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];

                if (char === '"') {
                    if (inQuotes && nextChar === '"') {

                        current += '"';
                        i++;
                    } else {

                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {

                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }


            result.push(current.trim());
            
            return result;
        };

        const headers = parseLine(lines[0]);
        const data = lines.slice(1)
            .filter(line => line.trim().length > 0)
            .map(line => parseLine(line));

        return { headers, data };
    };

    const handleFileSelect = (event) => {
        setError(null);
        const file = event.target.files[0];

        if (!file) return;


        if (!file.type.includes("text/csv") && !file.name.toLowerCase().endsWith('.csv')) {
            setError("Please select a valid CSV file.");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const { headers, data } = parseCSV(text);

                if (headers.length === 0) {
                    setError("Empty or invalid CSV file.");
                    return;
                }

                setRunnerFileData(activeTabData.id, [{
                    name: file.name,
                    headers,
                    data,
                    uploadDate: new Date().toISOString()
                }]);
                console.log(data);
                setRunnerIterations(activeTabData.id, data.length)
            } catch (err) {
                setError(`Failed to parse CSV: ${err.message}`);
            }
        };

        reader.onerror = () => {
            setError("Failed to read file.");
        };

        reader.readAsText(file);
        


        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handlePreview = () => {
        if (filesData.length > 0) {
            setPreviewData(filesData[0]);
            setDialogOpen(true);
        }
    };

    const handleRemoveFile = () => {
        setRunnerFileData(activeTabData.id, []);
        setRunnerIterations(activeTabData.id, 1)
        setError(null);
    };

    const handleCellChange = (event, rowIndex, cellIndex) => {
        if (!previewData) return;

        const updatedData = [...previewData.data];
        updatedData[rowIndex][cellIndex] = event.target.value;

        const updatedFile = {
            ...filesData[0],
            data: updatedData
        };

        setRunnerFileData(activeTabData.id, [updatedFile]);
        setPreviewData(prev => ({ ...prev, data: updatedData }));
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setPreviewData(null);
    };

    const fileData = filesData.length > 0 ? filesData[0] : null;

    return (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, }}>
            <Stack spacing={2}>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}


                {fileData ? (
                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2} flex={1}>
                                <DescriptionIcon color="action" />
                                <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                        {fileData.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {fileData.data.length} row{fileData.data.length !== 1 ? 's' : ''} × {fileData.headers.length} column{fileData.headers.length !== 1 ? 's' : ''}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<PreviewIcon />}
                                    onClick={handlePreview}
                                    sx={{ textTransform: "none" }}
                                >
                                    Preview
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleRemoveFile}
                                    sx={{ textTransform: "none" }}
                                >
                                    Remove
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                ) : (
                    <Box sx={{ textAlign: 'center', }}>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            size="large"
                            sx={{ textTransform: "none" }}
                        >
                            Select CSV File
                            <input
                                type="file"
                                hidden
                                accept=".csv"
                                onChange={handleFileSelect}
                                ref={fileInputRef}
                            />
                        </Button>
                    </Box>
                )}
            </Stack>


            {previewData && (
                <Dialog
                    open={isDialogOpen}
                    onClose={handleCloseDialog}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                {previewData.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {previewData.data.length} rows × {previewData.headers.length} columns
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                                            #
                                        </TableCell>
                                        {previewData.headers.map((header, i) => (
                                            <TableCell
                                                key={i}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    bgcolor: 'action.hover',
                                                    minWidth: 120
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.data.map((row, rowIndex) => (
                                        <TableRow key={rowIndex} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>
                                                {rowIndex + 1}
                                            </TableCell>
                                            {row.map((cell, cellIndex) => (
                                                <TableCell key={cellIndex}>
                                                    <TextField
                                                        variant="standard"
                                                        value={cell}
                                                        onChange={(e) => handleCellChange(e, rowIndex, cellIndex)}
                                                        fullWidth
                                                        size="small"
                                                        slotProps={{
                                                            input: {
                                                                disableUnderline: true,
                                                                sx: { fontSize: '0.875rem' }
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}