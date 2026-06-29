import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, FormControl, Select, MenuItem, Typography,
    IconButton, Table, TableBody, TableCell, TableHead, TableRow, InputBase,
    CircularProgress, Backdrop, Divider, Tooltip, Paper
} from '@mui/material';
import { Add, Delete, DeleteOutline, EditNoteOutlined, Save, SaveOutlined } from '@mui/icons-material';
import { useApp } from '../../ContextApi/AppContext';
import { envController } from '../../Controller/Environment';
import ObjectID from 'bson-objectid';

export const EnvironmentPanel = () => {
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
        if (selectedWorkspace) {
            const loadEnvs = async () => {
                setLoading(true);
                try {
                    const data = await envController.fetchAll(selectedWorkspace.id);
                    const enriched = data.map(env => ({
                        ...env,
                        variables: [...env.variables, { key: '', value: '' }], // always one empty
                    }));
                    setLocalEnvironments(enriched);
                    const currentIdIsValid = data.some(env => env.id === selectedEnvId);
                    if (!currentIdIsValid) {
                        setSelectedEnvId(enriched[0]?.id || '');
                    }
                } catch (err) {
                    console.error("Failed to load environments:", err);
                    setLocalEnvironments([]);
                } finally {
                    setLoading(false);
                }
            };
            loadEnvs();
        } else {
            setLocalEnvironments([]);
            setLoading(false);
        }
    }, [selectedWorkspace]);

    const selectedEnv = localEnvironments.find(env => env.id === selectedEnvId);

    const handleAddNewEnvironment = useCallback(() => {
        const tempId = new ObjectID().toHexString();
        const newEnv = {
            id: tempId,
            name: `New Environment ${localEnvironments.length + 1}`,
            variables: [{ key: '', value: '' }],
            isNew: true,
        };
        setLocalEnvironments(prev => [...prev, newEnv]);
        setSelectedEnvId(tempId);
    }, [localEnvironments.length, setSelectedEnvId]);

    const handleDeleteEnvironment = useCallback(async () => {
        if (!selectedEnvId || !selectedEnv || !window.confirm(`Delete "${selectedEnv.name}"?`)) return;

        const remainingEnvs = localEnvironments.filter(env => env.id !== selectedEnvId);
        setLocalEnvironments(remainingEnvs);
        setSelectedEnvId(remainingEnvs[0]?.id || '');
    }, [selectedEnvId, selectedEnv, localEnvironments, setSelectedEnvId]);

    const handleEnvNameChange = (newName) => {
        setLocalEnvironments(prev => prev.map(env => env.id === selectedEnvId ? { ...env, name: newName } : env));
    };

    // 🔹 Key change logic: auto-add empty row if user types in last one
    const handleVariableChange = (variableIndex, field, value) => {
        setLocalEnvironments(prev => prev.map(env => {
            if (env.id !== selectedEnvId) return env;

            const updatedVars = env.variables.map((v, i) =>
                i === variableIndex ? { ...v, [field]: value } : v
            );

            // If user is typing in the last row and it's non-empty, add a new empty row
            const lastVar = updatedVars[updatedVars.length - 1];
            if (lastVar.key.trim() !== '' || lastVar.value.trim() !== '') {
                updatedVars.push({ key: '', value: '' });
            }

            return { ...env, variables: updatedVars };
        }));
    };

    // 🔹 Delete variable but always keep one empty
    const handleDeleteVariable = (indexToDelete) => {
        setLocalEnvironments(prev =>
            prev.map(env => {
                if (env.id !== selectedEnvId) return env;

                let updatedVars = env.variables.filter((_, i) => i !== indexToDelete);
                if (updatedVars.length === 0) {
                    updatedVars = [{ key: '', value: '' }]; // always one empty row
                }
                return { ...env, variables: updatedVars };
            })
        );
    };

    const handleSave = async () => {
        if (!selectedWorkspace) return;
        setIsSaving(true);
        try {
            const payload = localEnvironments.map(env => ({
                id: env.id,
                name: env.name,
                variables: env.variables.filter(v => v.key.trim() !== ''), // exclude empty
                isNew: env.isNew || false,
            }));
            await envController.save(selectedWorkspace.id, payload);
            setGlobalEnvironments(localEnvironments);
        } catch (error) {
            console.error("Failed to save environments:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!selectedWorkspace) {
        return (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>Please select a workspace to manage environments.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Backdrop
                open={isSaving || loading}
                sx={{
                    position: 'absolute',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    color: '#fff',
                }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, flexShrink: 0 }}>
                Environments
            </Typography>

            {loading ? null : !selectedEnv && localEnvironments.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 4, flexGrow: 1 }}>
                    <Button
                        variant="contained"
                        onClick={handleAddNewEnvironment}
                        startIcon={<Add />}
                    >
                        Create Environment
                    </Button>
                </Box>
            ) : (
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2,
                            flexShrink: 0,
                          
                        }}
                    >
                        <FormControl fullWidth size="small" sx={{
                            
                        }}>
                            <Select
                               sx={{
                                borderRadius: 0.5
                               }}
                                value={selectedEnvId}
                                onChange={(e) => setSelectedEnvId(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>No Environment</em>
                                </MenuItem>
                                {localEnvironments.map((env) => (
                                    <MenuItem key={env.id} value={env.id}>
                                        {env.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Tooltip title="Add New">
                            <IconButton onClick={handleAddNewEnvironment}>
                                <Add />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Selected">
                            <span>
                                <IconButton
                                    onClick={handleDeleteEnvironment}
                                    disabled={!selectedEnvId}
                                >
                                    <DeleteOutline />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>

                    {selectedEnv && (
                        <Paper
                            variant="outlined"
                            sx={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                border: "none"
                                
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    p: '2px 8px',
                                    flexShrink: 0,
                                }}
                            >
                                <InputBase
                                    value={selectedEnv.name}
                                    onChange={(e) => handleEnvNameChange(e.target.value)}
                                    placeholder="Environment Name"
                                    sx={{ flex: 1, fontWeight: 500 }}
                                />
                                <EditNoteOutlined sx={{ mr: 1, color: 'text.secondary' }} />
                            </Box>

                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>VARIABLE</TableCell>
                                        <TableCell>VALUE</TableCell>
                                        <TableCell width="50px" />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedEnv.variables.map((variable, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <InputBase
                                                    fullWidth
                                                    value={variable.key}
                                                    onChange={(e) =>
                                                        handleVariableChange(
                                                            index,
                                                            'key',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Key"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <InputBase
                                                    fullWidth
                                                    value={variable.value}
                                                    onChange={(e) =>
                                                        handleVariableChange(
                                                            index,
                                                            'value',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Value"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleDeleteVariable(index)
                                                    }
                                                >
                                                    <DeleteOutline fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    )}
                </Box>
            )}

            <Divider sx={{ my: 2, flexShrink: 0 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<SaveOutlined />}
                    disabled={isSaving}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
};
