import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Typography,
    CircularProgress,
    Tooltip,
    IconButton,
    alpha,
    useTheme,
} from "@mui/material";
import { SendRounded, SaveOutlined, TableRowsOutlined, KeyboardArrowDown } from "@mui/icons-material";
import { useApp } from "../../../ContextApi/AppContext";
import { useNotification } from "../../../ContextApi/NotificationContext";
import { requestController } from "../../../Controller/request";
import { mapStateToApiRequest } from "../../../ContextApi/helper/stateTopayload";
import { debounce } from "../../../utils/debounce";
import EnvironmentDrawer from "./EnvironmentDrawer";
import { getMethodColor } from "../../Common/getMethodColour";

const API_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const RequestHeader = () => {
    const theme = useTheme();
    const { dispatch, sendRequest, activeTabData,
        selectedItem, activeTabId, renameDialogOpen } = useApp();
    const { showNotification } = useNotification();

    const { method = "GET", url = "", loading = false } = activeTabData;

    const [envDrawerOpen, setEnvDrawerOpen] = useState(false);
    const [locUrl, setLocUrl] = useState("");

    const mockEnvironments = [];

    const handleUrlChange = (event) => {
        const value = event.target.value;
        setLocUrl(value);
        debouncedDispatch(value);
    };

    const handleMethodChange = (event) => {
        dispatch({
            type: "SET_METHOD",
            payload: { tabId: activeTabId, value: event.target.value },
        });
    };

    const handleConfirmSave = async () => {
        if (!selectedItem?.id) return;
        try {
            const payload = mapStateToApiRequest({ ...activeTabData });
            await requestController.updateRequstwithId(selectedItem.id, payload);
            showNotification("Request saved!", "success");
        } catch (error) {
            showNotification("Failed to save request", "error");
        }
    };

    useEffect(() => {
        setLocUrl(url || "");
    }, [url]);

    const debouncedDispatch = useCallback(
        debounce((value) => {
            dispatch({ type: "SET_URL", payload: { tabId: activeTabId, value } });
        }, 300),
        [dispatch, activeTabId]
    );

    useEffect(() => {
        const handleKeyDown = async (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !renameDialogOpen) {
                e.preventDefault();
                if (loading) return;
                if (selectedItem && activeTabData.id && selectedItem.id !== activeTabData.id) {
                    showNotification("Save conflict: The selected request doesn't match the active tab.", "warning");
                    return;
                }
                if (selectedItem?.id) {
                    try {
                        const payload = mapStateToApiRequest(activeTabData);
                        await requestController.updateRequstwithId(selectedItem.id, payload);
                        showNotification("Request saved!", "success");
                    } catch (error) {
                        showNotification("Failed to save request", "error");
                    }
                } else {
                    showNotification("Select a request from the sidebar to save", "warning");
                }
            } else if (e.ctrlKey && e.key === 'Enter' && !renameDialogOpen) {
                e.preventDefault();
                if (!loading) sendRequest();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [activeTabData, selectedItem, loading]);

    const methodColor = getMethodColor(method);
    const canSave = !loading && !!selectedItem && selectedItem.id === activeTabData.id;

    return (
        <Box>
            {/* URL Bar */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.mode === 'dark' ? alpha('#000', 0.25) : '#fff',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    '&:focus-within': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                    },
                }}
            >
                {/* Method Selector */}
                <FormControl sx={{ flexShrink: 0 }}>
                    <Select
                        value={method}
                        onChange={handleMethodChange}
                        variant="standard"
                        disableUnderline
                        IconComponent={KeyboardArrowDown}
                        sx={{
                            height: 40,
                            pl: 1.5,
                            pr: 0.5,
                            minWidth: 90,
                            '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                py: 0,
                                pr: '24px !important',
                                backgroundColor: 'transparent',
                            },
                            '& .MuiSelect-icon': {
                                color: theme.palette.text.disabled,
                                fontSize: '16px',
                                right: 4,
                            },
                            '&:before, &:after': { display: 'none' },
                        }}
                        renderValue={(selected) => (
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    letterSpacing: '0.06em',
                                    color: methodColor,
                                    fontFamily: '"Inter", monospace',
                                    lineHeight: 1,
                                }}
                            >
                                {selected}
                            </Typography>
                        )}
                    >
                        {API_METHODS.map((m) => (
                            <MenuItem key={m} value={m}>
                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '12px',
                                        letterSpacing: '0.06em',
                                        color: getMethodColor(m),
                                        fontFamily: '"Inter", monospace',
                                        minWidth: 58,
                                    }}
                                >
                                    {m}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Separator */}
                <Box sx={{ width: '1px', height: 20, backgroundColor: theme.palette.divider, flexShrink: 0 }} />

                {/* URL Input */}
                <TextField
                    value={locUrl}
                    onChange={handleUrlChange}
                    placeholder="Enter request URL or paste cURL"
                    fullWidth
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                        '& .MuiInputBase-root': {
                            height: 40,
                            backgroundColor: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                border: 'none',
                            },
                            '&.Mui-focused': {
                                backgroundColor: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                            },
                        },
                        '& .MuiInputBase-input': {
                            fontFamily: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
                            fontSize: '13px',
                            color: theme.palette.text.primary,
                            px: 1,
                            py: 0,
                            '&::placeholder': {
                                color: theme.palette.text.disabled,
                                fontFamily: '"Inter", sans-serif',
                            },
                        },
                    }}
                />

                {/* Action icons inside URL bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1, flexShrink: 0 }}>
                    <Tooltip title={canSave ? "Save (Ctrl+S)" : "Select a collection item to save"} arrow>
                        <span>
                            <IconButton
                                size="small"
                                onClick={handleConfirmSave}
                                disabled={!canSave}
                                sx={{
                                    width: 28,
                                    height: 28,
                                    color: canSave ? theme.palette.text.secondary : theme.palette.text.disabled,
                                    '&:hover': { color: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, 0.08) },
                                }}
                            >
                                <SaveOutlined sx={{ fontSize: 15 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {/* Send Button row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Button
                    onClick={sendRequest}
                    disabled={loading || !url.trim()}
                    variant="contained"
                    sx={{
                        height: 34,
                        px: 2.5,
                        fontWeight: 600,
                        fontSize: '13px',
                        borderRadius: '6px',
                        gap: 0.8,
                        flexShrink: 0,
                    }}
                    startIcon={
                        loading
                            ? <CircularProgress size={13} color="inherit" thickness={3} />
                            : <SendRounded sx={{ fontSize: '14px !important' }} />
                    }
                >
                    {loading ? "Sending…" : "Send"}
                </Button>

                <Tooltip title="Manage environments" arrow>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<TableRowsOutlined sx={{ fontSize: '14px !important' }} />}
                        onClick={() => setEnvDrawerOpen(true)}
                        sx={{
                            height: 34,
                            px: 1.5,
                            fontSize: '12px',
                            color: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                            },
                        }}
                    >
                        Environments
                    </Button>
                </Tooltip>
            </Box>

            <EnvironmentDrawer
                open={envDrawerOpen}
                onClose={() => setEnvDrawerOpen(false)}
                initialEnvironments={mockEnvironments}
            />
        </Box>
    );
};

export default RequestHeader;
