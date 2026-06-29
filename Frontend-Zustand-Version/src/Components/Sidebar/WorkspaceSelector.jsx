import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, InputAdornment, Typography,
    Popover, Chip, CircularProgress, Alert, alpha
} from '@mui/material';
import { KeyboardArrowDown, Search, Add } from '@mui/icons-material';
import api from '../../Services/api';
import { useNotification } from "../../ContextApi/NotificationContext";
import { workspaceController } from '../../Controller/workspace';

export const WorkspaceSelector = ({ onWorkspaceSelect, selectedWorkspace , collections}) => {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [createMode, setCreateMode] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({ name: "", description: "" });
    const { showNotification } = useNotification();

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await workspaceController.getAllWorkspace();

            
            const workspacesData = Array.isArray(res) ? res : [];
            setWorkspaces(workspacesData);

            if (!selectedWorkspace && workspacesData.length > 0) {
                onWorkspaceSelect(workspacesData[0]);
            }
        } catch (err) {
            console.error('Failed to load workspaces:', err);
            setError('Failed to load workspaces');
            showNotification("Failed to load workspaces", "error");
        } finally {
            setLoading(false);
        }
    };


    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCreateMode(false);
        setFormData({ name: "", description: "" });
        setSearchTerm("");
        setError(null);
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post("/workspace/create", formData);
            setWorkspaces(prev => [...prev, data]);
            onWorkspaceSelect(data);
            showNotification("Workspace created successfully!", "success");
            handleClose();
        } catch (err) {
            console.error('Failed to create workspace:', err);
            setError('Failed to create workspace');
            showNotification("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleWorkspaceSelect = (workspace) => {
        onWorkspaceSelect(workspace);
        setOpen(false);
    };

    const filteredWorkspaces = (workspaces || []).filter(ws =>
        ws.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <>
            <Box sx={{
                p: 1, pb: 2, borderBottom: (theme) =>
                    theme.palette.mode === "dark"
                        ? `1px solid ${alpha(theme.palette.divider, 0.08)}`
                        : `1px solid ${alpha("#E5E7EB", 0.6)}`, mb: 1,
            }}>
                <Button
                    fullWidth
                    endIcon={<KeyboardArrowDown />}
                    onClick={handleOpen}
                    disabled={loading}
                    sx={{
                        mt: 2, justifyContent: "space-between",
                        textTransform: "none", fontSize: "14px", fontWeight: 500,
                        color: "text.primary", borderRadius: "12px",
                        background: (theme) => theme.palette.mode === "dark"
                            ? alpha(theme.palette.primary.main, 0.08)
                            : alpha(theme.palette.primary.main, 0.06),
                        border: (theme) => theme.palette.mode === "dark"
                            ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                            : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        "&:hover": {
                            background: (theme) => theme.palette.mode === "dark"
                                ? alpha(theme.palette.primary.main, 0.12)
                                : alpha(theme.palette.primary.main, 0.08),
                            boxShadow: (theme) => theme.palette.mode === "dark"
                                ? "0 2px 12px rgba(0,0,0,0.2)"
                                : "0 2px 12px rgba(0,0,0,0.06)",
                        },
                    }}
                >
                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedWorkspace ? selectedWorkspace.name : 'Select Workspace'}
                        </Typography>
                        {selectedWorkspace && (
                            <Typography variant="caption" color="text.secondary">
                                {collections.length || 0} collections
                            </Typography>
                        )}
                    </Box>
                    {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Button>
            </Box>

            <Popover
                open={open}
                onClose={handleClose}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{
                    paper: {
                        sx: { borderRadius: "12px", minHeight: "200px", minWidth: "420px", maxWidth: "500px", p: 2, maxHeight: '500px' }
                    }
                }}
            >
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}

                {!createMode ? (
                    <Box>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                            <TextField
                                placeholder="Search Workspaces"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                                sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                            />
                            <Button
                                onClick={() => setCreateMode(true)}
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                disabled={loading}
                                sx={{ height: "35px" }}
                            >
                                Create
                            </Button>
                        </Box>

                        <Box sx={{ overflow: 'auto' }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : filteredWorkspaces.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                                    {searchTerm ? 'No workspaces found' : 'No workspaces available'}
                                </Typography>
                            ) : (
                                filteredWorkspaces.map((workspace) => (
                                    <Box
                                        key={workspace.id}
                                        onClick={() => handleWorkspaceSelect(workspace)}
                                        sx={{
                                            p: 2, mb: 1, borderRadius: '8px', cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: selectedWorkspace?.id === workspace.id ? 'primary.main' : 'divider',
                                            backgroundColor: selectedWorkspace?.id === workspace.id
                                                ? alpha('#1976d2', 0.08)
                                                : 'transparent',
                                            '&:hover': {
                                                backgroundColor: alpha('#1976d2', 0.04),
                                                borderColor: 'primary.light',
                                                transform: 'translateY(1px)',
                                                boxShadow: 1
                                            },
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {workspace.name}
                                        </Typography>
                                        {workspace.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {workspace.description}
                                            </Typography>
                                        )}
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                            {/* <Chip size="small" label={`${collections.length || 0} collections`} variant="outlined" sx={{ fontSize: '11px' }} /> */}
                                            {/* {workspace.isOwner && <Chip size="small" label="Owner" color="primary" sx={{ fontSize: '11px' }} />} */}
                                            {workspace.members && <Chip size="small" label={`${workspace.members.length} members`} variant="outlined" sx={{ fontSize: '11px' }} />}
                                            {workspace.createdAt && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Created: {new Date(workspace.createdAt).toLocaleDateString()}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 600 }}>
                            Create New Workspace
                        </Typography>
                        <TextField
                            label="Workspace Name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth size="small" required
                            error={!formData.name.trim() && formData.name.length > 0}
                            helperText={!formData.name.trim() && formData.name.length > 0 ? 'Name is required' : ''}
                        />
                        <TextField
                            label="Description (Optional)"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth multiline rows={3} size="small"
                            placeholder="Describe the purpose of this workspace..."
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                            <Button onClick={handleClose} variant="outlined" size="small" disabled={loading}>Cancel</Button>
                            <Button
                                onClick={handleCreate}
                                variant="contained" size="small"
                                disabled={!formData.name.trim() || loading}
                                startIcon={loading ? <CircularProgress size={16} /> : null}
                            >
                                {loading ? 'Creating...' : 'Create Workspace'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Popover>
        </>
    );
};
