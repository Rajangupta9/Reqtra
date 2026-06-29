import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, InputAdornment, Typography,
    Popover, Chip, CircularProgress, Alert, alpha, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { KeyboardArrowDown, Search, Add, PersonAddOutlined, SettingsOutlined } from '@mui/icons-material';
import api from '../../Services/api';
import { useNotification } from "../../ContextApi/NotificationContext";
import { workspaceController } from '../../Controller/workspace';
import EditWorkspaceDialog from './EditWorkspaceDialog';

export const WorkspaceSelector = ({ onWorkspaceSelect, selectedWorkspace }) => {
    const [open, setOpen] = useState(false);
    const [settingOpen, setSettingOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [createMode, setCreateMode] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({ name: "", description: "" });
    const { showNotification } = useNotification();

    // New states for Share feature
    const [shareOpen, setShareOpen] = useState(false);
    const [selectedShareWorkspace, setSelectedShareWorkspace] = useState(null);
    const [shareEmail, setShareEmail] = useState("");


    const loadWorkspaces = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await workspaceController.getAllWorkspace();
            const workspacesData = Array.isArray(res) ? res : [];

            setWorkspaces(workspacesData);

            if (!selectedWorkspace && workspacesData.length > 0) {

                if (localStorage.getItem('selectedWorkspace')) {
                    const selectedWorkspaceId = localStorage.getItem('selectedWorkspace');
                    const selectedWorkspace = workspacesData.find(ws => ws.id === selectedWorkspaceId);
                    if (selectedWorkspace) {
                        onWorkspaceSelect(selectedWorkspace);

                    } else {
                        onWorkspaceSelect(workspacesData[0])
                        localStorage.setItem('selectedWorkspace', workspacesData[0].id);

                    }

                } else {

                    onWorkspaceSelect(workspacesData[0]);
                    localStorage.setItem('selectedWorkspace', workspacesData[0].id);

                }
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
            localStorage.setItem('selectedWorkspace', data.id);
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
        localStorage.setItem('selectedWorkspace', workspace.id);
        handleClose();
        setOpen(false);
    };

    //  Share Handlers
    const handleShareClick = (workspace) => {
        setSelectedShareWorkspace(workspace);
        setShareEmail("");
        setShareOpen(true);
    };
    const handleSettingClick = (workspaces) => {
        setSelectedShareWorkspace(workspaces);
        setSettingOpen(true);
    }

    const handleShareWorkspace = async () => {
        if (!shareEmail.trim()) return;

        setLoading(true);
        const payload = {
            id: selectedShareWorkspace.id,
            addMemberEmail: shareEmail
        };
        
        try {
            await workspaceController.UpdateWorkspace(payload)
            showNotification("User invited successfully!", "success");
            setShareOpen(false);
        } catch (err) {
            console.error('Share failed:', err);
            showNotification("Failed to share workspace", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkspaces();
    }, []);
    const filteredWorkspaces = (workspaces || []).filter(ws =>
        ws.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* --- Main Button --- */}
            <Box>
                <Button
                    fullWidth
                    endIcon={<KeyboardArrowDown />}
                    onClick={handleOpen}
                    disabled={loading}
                    sx={{
                        justifyContent: "space-between",
                        textTransform: "none", fontSize: "14px", fontWeight: 500,
                        color: "text.primary", borderRadius: '4px',
                        background: (theme) => theme.palette.mode === "dark"
                            ? alpha(theme.palette.primary.main, 0.08)
                            : alpha(theme.palette.primary.main, 0.06),
                        border: (theme) => theme.palette.mode === "dark"
                            ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                            : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                >
                    <Box sx={{
                        textAlign: 'left',
                        flex: 1,
                        height: '20px',
                        minWidth: '100px',
                        maxWidth: '200px',
                        ml: 1,
                        overflow: 'hidden'
                    }}>
                        <Typography sx={{
                            fontWeight: 600,
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                        }}>
                            {selectedWorkspace ? selectedWorkspace.name : 'Select Workspace'}
                        </Typography>
                    </Box>
                    {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Button>
            </Box>

            {/* --- Workspace Popover --- */}
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
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {!createMode ? (
                    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                                mb: 2,
                                position: "sticky",
                                top: 0,
                                zIndex: 10,
                                backgroundColor: "background.paper",
                            }}
                        >
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
                                        ),
                                    },
                                }}
                                sx={{
                                    flex: 1,
                                    "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                                }}
                            />
                            <Button
                                onClick={() => setCreateMode(true)}
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                disabled={loading}
                                sx={{ height: "35px", borderRadius: "8px" }}
                            >
                                Create
                            </Button>
                        </Box>

                        <Box sx={{ flex: 1, overflowY: "auto", pt: 1 }}>
                            {loading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : filteredWorkspaces.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textAlign: "center", p: 3 }}
                                >
                                    {searchTerm ? "No workspaces found" : "No workspaces available"}
                                </Typography>
                            ) : (
                                filteredWorkspaces.map((workspace) => (
                                    <Box
                                        key={workspace.id}
                                        sx={{
                                            p: 2,
                                            mb: 1,
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            border: "1px solid",
                                            borderColor:
                                                selectedWorkspace?.id === workspace.id
                                                    ? "primary.main"
                                                    : "divider",
                                            backgroundColor:
                                                selectedWorkspace?.id === workspace.id
                                                    ? (theme) => theme.palette.action.selected
                                                    : "transparent",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box
                                            onClick={() => handleWorkspaceSelect(workspace)}
                                            sx={{ flex: 1 }}
                                        >
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {workspace.name}
                                            </Typography>
                                            {workspace.description && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 1 }}
                                                >
                                                    {workspace.description}
                                                </Typography>
                                            )}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    alignItems: "center",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                {workspace.members && (
                                                    <Chip
                                                        size="small"
                                                        label={`${workspace.members.length} members`}
                                                        variant="outlined"
                                                        sx={{ fontSize: "11px" }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>


                                        <Box sx={{ gap: 2 }}>

                                            <IconButton
                                                onClick={() => handleSettingClick(workspace)}
                                                size='small'
                                            // color='primary'
                                            >
                                                <SettingsOutlined fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                onClick={() => handleShareClick(workspace)}
                                                size="small"
                                            // color="primary"
                                            >
                                                <PersonAddOutlined fontSize="small" />
                                            </IconButton>
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
                        />
                        <TextField
                            label="Description (Optional)"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth multiline rows={3} size="small"
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                            <Button onClick={handleClose} variant="outlined" size="small" disabled={loading}>Cancel</Button>
                            <Button
                                onClick={handleCreate}
                                variant="contained"
                                size="small"
                                disabled={!formData.name.trim() || loading}
                                startIcon={loading ? <CircularProgress size={16} /> : null}
                            >
                                {loading ? 'Creating...' : 'Create Workspace'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Popover>


            <Dialog open={shareOpen} onClose={() => setShareOpen(false)} fullWidth maxWidth="xs" >
                <DialogTitle>Share Workspace</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Enter the email address of the user you want to invite to <b>{selectedShareWorkspace?.name}</b>.
                    </Typography>
                    <TextField
                        label="User Email"
                        fullWidth
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        type="email"
                        size="small"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShareOpen(false)} variant="outlined" size="small">Cancel</Button>
                    <Button
                        onClick={handleShareWorkspace}
                        variant="contained"
                        size="small"
                        disabled={!shareEmail.trim() || loading}
                    >
                        {loading ? <CircularProgress size={16} /> : "Share"}
                    </Button>
                </DialogActions>
            </Dialog>

            <EditWorkspaceDialog
                open={settingOpen}
                onClose={() => setSettingOpen(false)}
                workspace={selectedShareWorkspace}
            />
        </>
    );
};
