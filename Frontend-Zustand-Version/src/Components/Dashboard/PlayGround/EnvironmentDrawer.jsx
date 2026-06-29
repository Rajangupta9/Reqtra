import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Drawer, FormControl, Select, MenuItem, Typography,
    IconButton, Table, TableBody, TableCell, TableHead, TableRow, InputBase,
    CircularProgress, Backdrop, Divider, Tooltip,
    TextField
} from '@mui/material';
import { Add, Delete, Edit, EditAttributes, EditAttributesOutlined, EditNoteOutlined, Save } from '@mui/icons-material';
import { envController } from '../../../Controller/Environment';
import ObjectID from 'bson-objectid';
import { useAppStore } from '../../../Store/useAppStore';

const EnvironmentDrawer = ({ open, onClose }) => {
    const selectedWorkspace = useAppStore(state => state.selectedWorkspace);
    const selectedEnvId = useAppStore(state => state.selectedEnvId);
    const environments = useAppStore(state => state.environments || []);


    const setSelectedEnvId = useAppStore(state => state.setSelectedEnvId);
    const setEnvironments = useAppStore(state => state.setEnvironments);

    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load environments when modal opens
    useEffect(() => {
        if (!open || !selectedWorkspace) return;

        const loadEnvs = async () => {
            setLoading(true);
            try {
                const data = await envController.fetchAll(selectedWorkspace.id);
                setEnvironments(data);

                if (!selectedEnvId && data.length) {
                    setSelectedEnvId(data[0].id);
                }
            } catch (err) {
                console.error("Failed to load environments:", err);
            } finally {
                setLoading(false);
            }
        };

        loadEnvs();
    }, [open, selectedWorkspace?.id]);


    const selectedEnv = environments.find(env => env?.id === selectedEnvId);



    const handleAddNewEnvironment = async () => {
        const tempId = new ObjectID().toHexString();
        const newEnv = { id: tempId, workspace: selectedWorkspace.id, name: `New Environment ${environments.length + 1}`, variables: [], isNew: true };
        setEnvironments(prev => [...prev, newEnv]);
        setSelectedEnvId(tempId);
    };




    // Delete environment
    const handleDeleteEnvironment = useCallback(async () => {
        if (!selectedEnvId || !selectedEnv) return;
        if (!window.confirm(`Are you sure you want to delete "${selectedEnv.name}"?`)) return;

        setIsSaving(true);
        try {
            if (!selectedEnv.isNew && selectedWorkspace) {
                await envController.delete(selectedWorkspace.id, selectedEnvId);
            }

            setEnvironments(prev => {
                const remaining = prev.filter(env => env.id !== selectedEnvId);
                setSelectedEnvId(remaining[0]?.id || '');
                return remaining;
            });
        } catch (err) {
            console.error("Failed to delete environment:", err);
        } finally {
            setIsSaving(false);
        }
    }, [selectedEnvId, selectedEnv, selectedWorkspace?.id, setEnvironments, setSelectedEnvId]);

    // Update environment name
    const handleEnvNameChange = useCallback((newName) => {
        setEnvironments(prev => prev.map(env =>
            env.id === selectedEnvId ? { ...env, name: newName } : env
        ));
    }, [selectedEnvId, setEnvironments]);

    // Update variable value
    const handleVariableChange = useCallback((variableIndex, field, value) => {
        setEnvironments(prev => prev.map(env =>
            env.id === selectedEnvId
                ? { ...env, variables: env.variables.map((v, i) => i === variableIndex ? { ...v, [field]: value } : v) }
                : env
        ));
    }, [selectedEnvId, setEnvironments]);

    // Add variable
    const handleAddVariable = useCallback(() => {
        if (!selectedEnv) return;
        setEnvironments(prev => prev.map(env =>
            env.id === selectedEnvId
                ? { ...env, variables: [...env.variables, { key: '', value: '' }] }
                : env
        ));
    }, [selectedEnvId, selectedEnv, setEnvironments]);

    // Delete variable
    const handleDeleteVariable = useCallback((indexToDelete) => {
        setEnvironments(prev => prev.map(env =>
            env.id === selectedEnvId
                ? { ...env, variables: env.variables.filter((_, i) => i !== indexToDelete) }
                : env
        ));
    }, [selectedEnvId, setEnvironments]);

    // Save environments and close
    const handleCloseAndSave = useCallback(async () => {
        if (!selectedWorkspace) return onClose();
        if (!environments.length) return onClose();

        setIsSaving(true);
        try {
            const payload = environments.map(env => ({
                id: env.id,
                name: env.name,
                variables: env.variables,
                isNew: env.isNew || false,
            }));

            await envController.save(selectedWorkspace.id, payload);
        } catch (error) {
            console.error("Failed to save environments:", error);
        } finally {
            setIsSaving(false);
            onClose();
        }
    }, [selectedWorkspace, environments, onClose]);



    return (
        <Drawer anchor="right" open={open} onClose={handleCloseAndSave}>
            <Box sx={{ width: 500, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>

                <Backdrop open={isSaving || loading} sx={{ position: 'absolute', zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}>
                    <CircularProgress color="inherit" />
                </Backdrop>

                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Environments
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : environments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 4, flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                            No environments found. Create one to get started.
                        </Typography>
                        <Button variant="contained" onClick={handleAddNewEnvironment} startIcon={<Add />}>
                            Create Environment
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FormControl fullWidth size="small">
                                <Select value={selectedEnvId} onChange={(e) => setSelectedEnvId(e.target.value)}>
                                    <MenuItem value=""><em>No Environment</em></MenuItem>
                                    {environments.map(env => (
                                        <MenuItem key={env.id} value={env.id}>{env.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Tooltip title="Add New Environment">
                                <IconButton onClick={handleAddNewEnvironment}>
                                    <Add />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Selected Environment">

                                <span>
                                    <IconButton onClick={handleDeleteEnvironment} disabled={!selectedEnvId}>
                                        <Delete />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>

                        {selectedEnv && (
                            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        borderBottom: 1,
                                        borderColor: "divider",
                                        p: "2px 4px",
                                        mb: 1
                                    }}
                                >
                                    <EditNoteOutlined sx={{ mr: 1 }} />
                                    <InputBase
                                        value={selectedEnv.name}
                                        onChange={(e) => handleEnvNameChange(e.target.value)}
                                        placeholder="Environment Name"

                                        sx={{
                                            flex: 1,
                                            fontWeight: 500,
                                            fontSize: "1.1rem",

                                            px: 1,
                                            py: 0.5,
                                            borderRadius: "4px",


                                        }}
                                    />
                                </Box>




                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VARIABLE</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VALUE</TableCell>
                                            <TableCell width="50px" />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedEnv.variables.map((variable, index) => (
                                            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>
                                                    <InputBase
                                                        sx={{
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: "4px",
                                                            // backgroundColor: "background.default"
                                                        }}
                                                        size='small' fullWidth value={variable.key} onChange={(e) => handleVariableChange(index, 'key', e.target.value)} placeholder="Key" />
                                                </TableCell>
                                                <TableCell>
                                                    <InputBase
                                                        sx={{
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: "4px",
                                                            // backgroundColor: "background.default"
                                                        }}
                                                        size='small' fullWidth value={variable.value} onChange={(e) => handleVariableChange(index, 'value', e.target.value)} placeholder="Value" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={() => handleDeleteVariable(index)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button onClick={handleAddVariable} startIcon={<Add />} sx={{ mt: 1 }}>
                                    Add Variable
                                </Button>
                            </Box>
                        )}

                        {!selectedEnv && environments.length > 0 && (
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">Select an environment to view its variables.</Typography>
                            </Box>
                        )}
                    </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleCloseAndSave} variant="contained" startIcon={<Save />}>
                        Save and Close
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default EnvironmentDrawer;