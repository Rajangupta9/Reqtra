import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    Button,
    Box,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    IconButton,
    CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useColorMode } from "../../Theme/ThemeContext";
import { collectionController } from "../../Controller/Collection";
import { DriveFolderUploadOutlined } from "@mui/icons-material";

export default function ImportButton({ selectedWorkspace, loadTopLevelCollections }) {
    const [open, setOpen] = useState(false);
    const [fileName, setFileName] = useState("");
    const [jsonText, setJsonText] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState("");

    const { mode } = useColorMode();

    const resetState = () => {
        setFileName("");
        setJsonText("");
        setError("");
        setIsImporting(false);
    };

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        resetState();
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setError("");
        setFileName(file.name);

        try {
            const text = await file.text();
            setJsonText(text);
        } catch (err) {
            setError("Could not read the selected file.");
            setFileName("");
        }

        event.target.value = null;
    };

    const handleRemoveFile = () => {
        setFileName("");
        setJsonText("");
    };

    const handleImport = async () => {
        setIsImporting(true);
        setError("");

        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonText);
        } catch (err) {
            setError("Invalid JSON format. Please check the editor for errors.");
            setIsImporting(false);
            return;
        }

        try {
            const res = await collectionController.import(selectedWorkspace.id, parsedJson)
            loadTopLevelCollections(selectedWorkspace.id);
            handleClose();
        } catch (apiError) {
            console.error("API Error:", apiError);
            setError(apiError.response?.data?.message || "Failed to import the collection. Please create workspace first to import.");
        } finally {
            setIsImporting(false);
        }
    };


    const onEditorChange = (value) => {
        if (error) setError("");
        setJsonText(value);
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mr: '8px' }}>
            <Tooltip title="Import collection or request">
                <span>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<DriveFolderUploadOutlined />}
                        onClick={handleOpen}
                        disabled={!selectedWorkspace}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            bgcolor: "background.default",
                            color: "text.primary",
                            boxShadow: "none",
                        }}
                    >
                        Import
                    </Button>
                </span>
            </Tooltip>


            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2
                        }
                    }
                }}
            >
                <DialogTitle>Import Collection</DialogTitle>

                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Paste your collection's JSON content below or upload a .json file.
                    </Typography>


                    <Box sx={{ border: '1px solid', borderColor: error ? 'error.main' : 'divider' }}>
                        <CodeMirror
                            value={jsonText}
                            height="500px"

                            theme={mode === "dark" ? vscodeDark : vscodeLight}
                            extensions={[json(), EditorView.lineWrapping]}
                            onChange={onEditorChange}
                            basicSetup={{
                                foldGutter: true,
                                dropCursor: true,
                                allowMultipleSelections: false,
                                indentOnInput: true,
                            }}
                        />
                    </Box>
                    {error && (
                        <Typography color="error" variant="caption" sx={{ mt: 1, ml: 1 }}>
                            {error}
                        </Typography>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                        <Button component="label" variant="outlined" color="text.primary" disabled={!!fileName || isImporting}>
                            {fileName ? fileName : "Upload File"}
                            <input hidden type="file" accept=".json" onChange={handleFileUpload} />
                        </Button>
                        {fileName && (
                            <IconButton size="small" onClick={handleRemoveFile} disabled={isImporting}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} disabled={isImporting}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleImport}
                        disabled={!jsonText.trim() || isImporting}
                        startIcon={isImporting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isImporting ? "Importing..." : "Import"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

ImportButton.propTypes = {
    selectedWorkspace: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    loadTopLevelCollections: PropTypes.func.isRequired,
};