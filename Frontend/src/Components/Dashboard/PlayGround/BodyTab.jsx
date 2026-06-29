import React, { useState, useEffect, useCallback, memo } from "react";
import {
    Box,
    Tabs,
    Tab,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import { useApp } from '../../../ContextApi/AppContext';
import KeyValueTable from './keyValueTable';
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useColorMode } from '../../../Theme/ThemeContext';
import { autocompletion } from "@codemirror/autocomplete";
import { fakerOptions } from "./helper/FakerOption";
import { ActionTypes } from "../../../ContextApi/helper/actionTypes";



const BodyTab = () => {
    const { activeTabData, activeTabId, dispatch } = useApp();
    const { bodyType, rawBody, formData, urlEncodedData } = activeTabData;
    const { mode } = useColorMode();

    const [localRawBody, setLocalRawBody] = useState(rawBody);
    const [localFormData, setLocalFormData] = useState(formData);
    const [localUrlEncoded, setLocalUrlEncoded] = useState(urlEncodedData);
    const [error, setError] = useState("");

    useEffect(() => setLocalRawBody(rawBody), [rawBody]);
    useEffect(() => setLocalFormData(formData), [formData]);
    useEffect(() => setLocalUrlEncoded(urlEncodedData), [urlEncodedData]);




    const handleBodyTypeChange = useCallback((_event, newValue) => {
        dispatch({ type: ActionTypes.SET_BODY_TYPE, payload: { tabId: activeTabId, value: newValue } });
    }, [dispatch]);

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

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localRawBody !== rawBody) {
                dispatch({ type: ActionTypes.SET_RAW_BODY, payload: { tabId: activeTabId, value: localRawBody } });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localRawBody, rawBody, dispatch]);


    // For Form Data
    useEffect(() => {
        // Auto-add blank row logic
        if (Array.isArray(localFormData) && localFormData.length > 0) {
            const last = localFormData[localFormData.length - 1];
            const isLastEmpty = last.key === "" && last.value === "";
            if (!isLastEmpty) addFormDataRow();
        } else if (!Array.isArray(localFormData) || localFormData.length === 0) {
            addFormDataRow();
        }

        // Debounced update to global store
        const timer = setTimeout(() => {
            if (JSON.stringify(localFormData) !== JSON.stringify(formData)) {
                dispatch({
                    type: ActionTypes.UPDATE_FORM_DATA,
                    payload: { tabId: activeTabId, formData: localFormData },
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localFormData, formData, dispatch, addFormDataRow, activeTabId]);


    // For x-www-form-urlencoded Data
    useEffect(() => {
        // Auto-add blank row logic
        if (Array.isArray(localUrlEncoded) && localUrlEncoded.length > 0) {
            const last = localUrlEncoded[localUrlEncoded.length - 1];
            const isLastEmpty = last.key === "" && last.value === "";
            if (!isLastEmpty) addUrlEncodedRow();
        } else if (!Array.isArray(localUrlEncoded) || localUrlEncoded.length === 0) {
            addUrlEncodedRow();
        }

        // Debounced update to global store
        const timer = setTimeout(() => {
            if (JSON.stringify(localUrlEncoded) !== JSON.stringify(urlEncodedData)) {
                dispatch({
                    type: ActionTypes.UPDATE_URL_ENCODED_DATA,
                    payload: { tabId: activeTabId, urlEncodedData: localUrlEncoded },
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localUrlEncoded, urlEncodedData, dispatch, addUrlEncodedRow, activeTabId]);




    const codeMirrorExtensions = [
        json(),
        EditorView.lineWrapping,
        autocompletion({ override: [fakerCompletion] }),
    ];

    return (
        <Box>
            {/* Body type selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Tabs
                    value={bodyType || 'raw'}
                    onChange={handleBodyTypeChange}
                    sx={{
                        minHeight: 32,
                        '& .MuiTab-root': { minHeight: 32, py: 0, px: 1.5, fontSize: '12px' },
                        '& .MuiTabs-indicator': { height: 2 },
                    }}
                >
                    <Tab label="Raw" value="raw" disableRipple />
                    <Tab label="Form Data" value="formdata" disableRipple />
                    <Tab label="URL Encoded" value="urlencoded" disableRipple />
                </Tabs>

                {bodyType === 'raw' && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleBeautify}
                        sx={{ fontSize: '11px', height: 26, px: 1.5 }}
                    >
                        Beautify
                    </Button>
                )}
            </Box>

            {bodyType === 'raw' && (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', overflow: 'hidden' }}>
                    <CodeMirror
                        value={localRawBody}
                        onChange={setLocalRawBody}
                        height="320px"
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