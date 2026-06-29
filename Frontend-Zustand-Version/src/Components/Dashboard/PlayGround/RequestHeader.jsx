import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Button, FormControl, Select, MenuItem, TextField, Typography, Chip,
    CircularProgress, Dialog, Drawer, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Divider, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Send, Save, History, Public } from '@mui/icons-material';
import { requestController } from '../../../Controller/request';
import { useNotification } from '../../../ContextApi/NotificationContext';
import { mapStateToApiRequest } from '../../../ContextApi/helper/stateTopayload';
import { debounce } from '../../../utils/debounce';
import EnvironmentDrawer from './EnvironmentDrawer';
import { useAppStore } from '../../../Store/useAppStore';
import { getMethodColor } from '../../Common/getMethodColour';

const API_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const RequestHeader = () => {
    // Zustand store values
    const method = useAppStore((state) => state.activeTabData()?.request?.method || 'GET');
    const url = useAppStore((state) => state.activeTabData()?.request?.url || '');
    const loading = useAppStore((state) => state.activeTabData()?.request?.loading || false);
    const activeTabData = useAppStore((state) => state.activeTabData());
    const selItem = useAppStore((state) => state.selItem);

    const log = useAppStore((state) => state.activeTabData())


    // Zustand actions
    const sendRequest = useAppStore((state) => state.sendRequest);
    const setMethod = useAppStore((state) => state.setMethod);
    const setUrl = useAppStore((state) => state.setUrl);
    const setName = useAppStore((state) => state.setName);

    // Notification
    const { showNotification } = useNotification();

    // Local states
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [requestName, setRequestName] = useState('');
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [envDrawerOpen, setEnvDrawerOpen] = useState(false);
    const [locUrl, setLocUrl] = useState('');

    const mockEnvironments = [];

    // Handlers
    const handleUrlChange = (event) => {
        const value = event.target.value;
        setLocUrl(value);
        debouncedSetUrl(value);
    };

    const handleMethodChange = (event) => {
        setMethod(event.target.value);
    };

    const handleOpenSaveDialog = () => {
        setRequestName(activeTabData?.name || '');
        setSaveDialogOpen(true);
    };

    const handleCloseSaveDialog = () => {
        setSaveDialogOpen(false);
        setRequestName('');
    };

    const handleConfirmSave = async () => {
        setName(requestName);
        try {
            console.log(activeTabData);
            const updatedData = { ...activeTabData.request, name: requestName };
            const payload = mapStateToApiRequest(updatedData);
            await requestController.updateRequstwithId(selItem.request.id, payload);
            showNotification('Request updated successfully', 'success');
        } catch (error) {
            showNotification('Failed to update request', 'error');
        } finally {
            handleCloseSaveDialog();
        }
    };



    useEffect(() => {
        setLocUrl(url || '');
    }, [url]);

    const debouncedSetUrl = useCallback(
        debounce((value) => {
            setUrl(value);
        }, 300),
        [setUrl]
    );

    return (
        <Box>
          
            <Box sx={{ display: "flex", mb: 2, alignItems: "center", gap: 1 }}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                    <FormControl sx={{ minWidth: 120 }}>
                        <Select
                            value={method}
                            onChange={handleMethodChange}
                            sx={{ height: 44, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                            renderValue={(selected) => (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "flex",
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: "12px",
                                        px: "8px",
                                        py: "3px",
                                        borderRadius: "8px",
                                        bgcolor: `${getMethodColor(selected)}20`, 
                                        color: getMethodColor(selected),
                                        textAlign: "center",
                                        minWidth: 60,
                                    }}
                                >
                                    {selected}
                                </Typography>
                                
                            )}
                        >
                            {API_METHODS.map((m) => (
                                <MenuItem key={m} value={m}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "inline-block",
                                            fontWeight: 600,
                                            fontSize: "12px",
                                            px: "8px",
                                            py: "3px",
                                            borderRadius: "8px",
                                            bgcolor: `${getMethodColor(m)}20`,
                                            color: getMethodColor(m),
                                            textAlign: "center",
                                            minWidth: 60,
                                        }}
                                    >
                                        {m}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Select>

                    </FormControl>
                    <TextField
                        value={locUrl}
                        onChange={handleUrlChange}
                        placeholder="Enter request URL"
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: 44,
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                            },
                        }}
                    />
                </Box>

                <Button
                    onClick={sendRequest}
                    disabled={loading || !url.trim()}
                    variant="contained"
                    sx={{ height: 44, px: 3, fontWeight: 600 }}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                >
                    {loading ? "Sending..." : "Send"}
                </Button>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Save />}
                    onClick={handleOpenSaveDialog}
                    disabled={!url.trim() || !selItem || selItem.id !== activeTabData?.id}
                    sx={{ bgcolor: 'background.paper', boxShadow: 'none', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
                >
                    Save
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<History />}
                    onClick={() => setHistoryDrawerOpen(true)}
                    sx={{ bgcolor: 'background.paper', boxShadow: 'none', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
                >
                    History
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Public />}
                    onClick={() => setEnvDrawerOpen(true)}
                    sx={{ bgcolor: 'background.paper', boxShadow: 'none', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
                >
                    Env
                </Button>
            </Box>

            {/* Save Dialog */}
            <Dialog open={saveDialogOpen} onClose={handleCloseSaveDialog}>
                <DialogTitle>Save Request</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter a name for this request to save it to your collections.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Request Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSaveDialog}>Cancel</Button>
                    <Button onClick={handleConfirmSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Env Drawer */}
            <EnvironmentDrawer
                open={envDrawerOpen}
                onClose={() => setEnvDrawerOpen(false)}
                initialEnvironments={mockEnvironments}
            />
        </Box>
    );
};

export default RequestHeader;
