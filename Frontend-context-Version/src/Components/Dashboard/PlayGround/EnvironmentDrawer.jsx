import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Drawer, FormControl, Select, MenuItem, Typography,
    IconButton, Table, TableBody, TableCell, TableHead, TableRow, InputBase,
    CircularProgress, Backdrop, Divider, Tooltip
} from '@mui/material';
import { Add, Delete, DeleteOutline, EditNoteOutlined, Save } from '@mui/icons-material';
import { useApp } from '../../../ContextApi/AppContext';
import { envController } from '../../../Controller/Environment';
import ObjectID from 'bson-objectid';

const EnvironmentDrawer = ({ open, onClose }) => {
   
    const {
        selectedWorkspace,
        selectedEnvId,
        setSelectedEnvId,
        setEnvironments: setGlobalEnvironments 
    } = useApp();

   
    const [localEnvironments, setLocalEnvironments] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true); 

   
    useEffect(() => {
        if (open && selectedWorkspace) {
            const loadEnvs = async () => {
                setLoading(true);
                try {
                    const data = await envController.fetchAll(selectedWorkspace.id);
                   
                    setLocalEnvironments(data);

                    const currentIdIsValid = data.some(env => env.id === selectedEnvId);
                    if (!currentIdIsValid) {
                        setSelectedEnvId(data[0]?.id || '');
                    }

                } catch (err) {
                    console.error("Failed to load environments:", err);
                    setLocalEnvironments([]); 
                } finally {
                    setLoading(false);
                }
            };
            loadEnvs();
        }
    }, [open, selectedWorkspace]);


   
    const selectedEnv = localEnvironments.find(env => env.id === selectedEnvId);

   
    const handleAddNewEnvironment = useCallback(() => {
        const tempId = new ObjectID().toHexString();
        const newEnv = {
            id: tempId,
            name: `New Environment ${localEnvironments.length + 1}`,
            variables: [],
            isNew: true,
        };

        setLocalEnvironments(prev => [...prev, newEnv]);
        setSelectedEnvId(tempId);
    }, [localEnvironments.length, setSelectedEnvId]);


    const handleDeleteEnvironment = useCallback(async () => {
        if (!selectedEnvId || !selectedEnv) return;
        if (!window.confirm(`Are you sure you want to delete the "${selectedEnv.name}" environment?`)) {
            return;
        }

      
        const remainingEnvs = localEnvironments.filter(env => env.id !== selectedEnvId);
        setLocalEnvironments(remainingEnvs);
        setSelectedEnvId(remainingEnvs[0]?.id || '');

    }, [selectedEnvId, selectedEnv, localEnvironments, setSelectedEnvId]);


    const handleEnvNameChange = useCallback((newName) => {
        setLocalEnvironments(prevEnvs =>
            prevEnvs.map(env =>
                env.id === selectedEnvId ? { ...env, name: newName } : env
            )
        );
    }, [selectedEnvId]);


    const handleVariableChange = useCallback((variableIndex, field, value) => {
        setLocalEnvironments(prevEnvs =>
            prevEnvs.map(env =>
                env.id === selectedEnvId
                    ? {
                        ...env,
                        variables: env.variables.map((v, i) =>
                            i === variableIndex ? { ...v, [field]: value } : v
                        ),
                    }
                    : env
            )
        );
    }, [selectedEnvId]);

    const handleAddVariable = useCallback(() => {
        if (!selectedEnv) return;
        setLocalEnvironments(prev =>
            prev.map(env =>
                env.id === selectedEnvId
                    ? { ...env, variables: [...env.variables, { key: '', value: '' }] }
                    : env
            )
        );
    }, [selectedEnvId, selectedEnv]);

    const handleDeleteVariable = useCallback((indexToDelete) => {
        setLocalEnvironments(prev =>
            prev.map(env =>
                env.id === selectedEnvId
                    ? { ...env, variables: env.variables.filter((_, i) => i !== indexToDelete) }
                    : env
            )
        );
    }, [selectedEnvId]);


   
    const handleCloseAndSave = async () => {
        if (!selectedWorkspace) {
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            const payload = localEnvironments.map(env => ({
                id: env.id,
                name: env.name,
                variables: env.variables.filter(v => v.key.trim() !== ''),
                isNew: env.isNew || false,
            }));

            await envController.save(selectedWorkspace.id, payload);

           
            setGlobalEnvironments(localEnvironments);

        } catch (error) {
            console.error("Failed to save environments:", error);
            
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

 
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
                ) : (!selectedEnv && localEnvironments.length === 0) ? (
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
                                    {localEnvironments.map(env => (
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
                                        <DeleteOutline />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>

                        {selectedEnv && (
                            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                <Box sx={{ display: "flex", alignItems: "center", borderBottom: 1, borderColor: "divider", p: "2px 4px", mb: 1 }}>
                                    <EditNoteOutlined sx={{ mr: 1 }} />
                                    <InputBase
                                        value={selectedEnv.name}
                                        onChange={(e) => handleEnvNameChange(e.target.value)}
                                        placeholder="Environment Name"
                                        sx={{ flex: 1, fontWeight: 500, fontSize: "1.1rem" }}
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
                                                        sx={{ px: 1, py: 0.5, borderRadius: "4px" }}
                                                        size='small' fullWidth value={variable.key} onChange={(e) => handleVariableChange(index, 'key', e.target.value)} placeholder="Key" />
                                                </TableCell>
                                                <TableCell>
                                                    <InputBase
                                                        sx={{ px: 1, py: 0.5, borderRadius: "4px" }}
                                                        size='small' fullWidth value={variable.value} onChange={(e) => handleVariableChange(index, 'value', e.target.value)} placeholder="Value" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={() => handleDeleteVariable(index)}>
                                                        <DeleteOutline fontSize="small" />
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
                        {!selectedEnv && localEnvironments.length > 0 && (
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