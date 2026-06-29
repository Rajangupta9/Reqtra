import React, { useState, useEffect, useCallback, memo } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import { useApp, ActionTypes } from '../../../ContextApi/AppContext';
import KeyValueTable from './keyValueTable';
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useColorMode } from '../../../Theme/ThemeContext';
import { autocompletion } from "@codemirror/autocomplete";
import { fakerOptions } from "./helper/FakerOption";
import { useAppStore } from "../../../Store/useAppStore";



const BodyTab = () => {
    // const { state, dispatch } = useApp();
    // const { bodyType, rawBody, formData, urlEncodedData } = state;


    const bodyType = useAppStore((state) => state.activeTabData()?.request?.bodyType)
    const rawBody = useAppStore((state) => state.activeTabData()?.request?.rawBody)
    const formData = useAppStore((state) => state.activeTabData()?.request?.formData)
    const urlEncodedData = useAppStore((state) => state.activeTabData()?.request?.urlEncodedData)

    const log = useAppStore((state) => state.activeTabData()?.request)
   
    const { mode } = useColorMode();


    const setBodyType = useAppStore((state) => state.setBodyType);
    const setRawBody = useAppStore((state) => state.setRawBody);
    const updateFormData = useAppStore((state) => state.updateFormData);
    const updateUrlEncodedData = useAppStore((state) => state.updateUrlEncodedData);

    const [localRawBody, setLocalRawBody] = useState(rawBody);
    const [localFormData, setLocalFormData] = useState(formData);
    const [localUrlEncoded, setLocalUrlEncoded] = useState(urlEncodedData);
    const [error, setError] = useState("");

    useEffect(() => setLocalRawBody(rawBody), [rawBody]);
    useEffect(() => setLocalFormData(formData), [formData]);
    useEffect(() => setLocalUrlEncoded(urlEncodedData), [urlEncodedData]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         if (localRawBody !== rawBody) {
    //             dispatch({ type: ActionTypes.SET_RAW_BODY, payload: localRawBody });
    //         }
    //     }, 300);
    //     return () => clearTimeout(timer);
    // }, [localRawBody, rawBody, dispatch]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         if (JSON.stringify(localFormData) !== JSON.stringify(formData)) {
    //             dispatch({ type: ActionTypes.UPDATE_FORM_DATA, payload: localFormData });
    //         }
    //     }, 300);
    //     return () => clearTimeout(timer);
    // }, [localFormData, formData, dispatch]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         if (JSON.stringify(localUrlEncoded) !== JSON.stringify(urlEncodedData)) {
    //             dispatch({ type: ActionTypes.UPDATE_URL_ENCODED_DATA, payload: localUrlEncoded });
    //         }
    //     }, 300);
    //     return () => clearTimeout(timer);
    // }, [localUrlEncoded, urlEncodedData, dispatch]);

    // Raw Body
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localRawBody !== rawBody) {
                setRawBody(localRawBody);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localRawBody, rawBody, setRawBody]);

    // Form Data
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(localFormData) !== JSON.stringify(formData)) {
                updateFormData(localFormData);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localFormData, formData, updateFormData]);

    // URL Encoded
    useEffect(() => {
        const timer = setTimeout(() => {
            if (JSON.stringify(localUrlEncoded) !== JSON.stringify(urlEncodedData)) {
                updateUrlEncodedData(localUrlEncoded);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localUrlEncoded, urlEncodedData, updateUrlEncodedData]);


    // const handleBodyTypeChange = useCallback((_event, newValue) => {
    //     dispatch({ type: ActionTypes.SET_BODY_TYPE, payload: newValue });
    // }, [dispatch]);

    const handleBodyTypeChange = useCallback((_event, newValue) => {
        setBodyType(newValue);
    }, [setBodyType]);

    const addFormDataRow = useCallback(() => {
        setLocalFormData(prev => [...prev, { key: "", value: "", type: "text", enabled: true }]);
    }, []);



    const removeFormDataRow = useCallback((index) => {
        setLocalFormData(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
    }, []);

    const addUrlEncodedRow = useCallback(() => {
        setLocalUrlEncoded(prev => [...prev, { key: "", value: "", enabled: true }]);
    }, []);

    const removeUrlEncodedRow = useCallback((index) => {
        setLocalUrlEncoded(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
    }, []);

    const handleBeautify = useCallback(() => {
        try {
            if (!localRawBody.trim()) {
                setError("Cannot beautify empty content.");
                return;
            }
            const parsed = JSON.parse(localRawBody);
            const pretty = JSON.stringify(parsed, null, 2);
            setLocalRawBody(pretty);
            setError("");
        } catch (err) {
            setError(`Invalid JSON: ${err.message}`);
        }
    }, [localRawBody]);

    const fakerCompletion = (context) => {
        const word = context.matchBefore(/\w*/);

        if (!word) {
            return null;
        }

        if (word.from === word.to && !context.explicit) {
            return null;
        }

        return {
            from: word.from,
            options: fakerOptions.map(opt => ({
                label: opt.label,
                type: "variable",
                apply: opt.value,
            })),
        };
    };

    

    const codeMirrorExtensions = [
        json(),
        EditorView.lineWrapping,
        autocompletion({ override: [fakerCompletion] }),
    ];

    const tabStyles = {
        textTransform: 'none',
        fontWeight: 500,
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
                    Request Body
                </Typography>
                {bodyType === 'raw' && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleBeautify}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Beautify JSON
                    </Button>
                )}
            </Box>

            <Tabs
                value={bodyType || 'raw'}
                onChange={handleBodyTypeChange}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Raw" value="raw" sx={tabStyles} />
                <Tab label="Form Data" value="formdata" sx={tabStyles} />
                <Tab label="URL Encoded" value="urlencoded" sx={tabStyles} />
            </Tabs>

            {bodyType === 'raw' && (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                    <CodeMirror
                        value={localRawBody}
                        onChange={setLocalRawBody}
                        height="350px"
                        extensions={codeMirrorExtensions}
                        theme={mode === "dark" ? vscodeDark : vscodeLight}
                    />
                </Box>
            )}

            {bodyType === 'formdata' && (
                <KeyValueTable
                    data={localFormData}
                    onChange={setLocalFormData}
                    onAdd={addFormDataRow}
                    onRemove={removeFormDataRow}
                    hasTypeColumn
                    placeholder={{ key: 'Field name', value: 'Field value', description: 'Description' }}
                    typeOptions={[{ value: 'text', label: 'Text' }, { value: 'file', label: 'File' }]}
                />
            )}

            {bodyType === 'urlencoded' && (
                <KeyValueTable
                    data={localUrlEncoded}
                    onChange={setLocalUrlEncoded}
                    onAdd={addUrlEncodedRow}
                    onRemove={removeUrlEncodedRow}
                    hasDescriptionColumn={false}
                    placeholder={{ key: 'Parameter name', value: 'Parameter value' }}
                />
            )}

            <Snackbar
                open={!!error}
                autoHideDuration={4000}
                onClose={() => setError("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="error" onClose={() => setError("")} sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default memo(BodyTab);