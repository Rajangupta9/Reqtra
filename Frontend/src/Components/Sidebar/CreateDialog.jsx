import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';

export const CreateDialog = ({ 
    open, 
    onClose, 
    onCreate, 
    type, 
    parentId,
    loading 
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [errors, setErrors] = useState({});

    React.useEffect(() => {
        if (!open) {
            setFormData({
                name: '',
                description: ''
            });
            setErrors({});
        }
    }, [open]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (type === 'request') {
            if (!formData.url.trim()) {
                newErrors.url = 'URL is required';
            } else if (!formData.url.startsWith('/') && !formData.url.startsWith('http')) {
                newErrors.url = 'URL should start with / or http';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        onCreate({
            ...formData,
            type: type,
            parentId: parentId
        });
    };

    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            slotProps={{
                paper: {
                    sx: { borderRadius: '10px' }
                }
            }}
            
        >
            <DialogTitle sx={{
                pb: '8px'
            }}>
                <Typography variant="h6" component="div">
                    Create New {type === 'collection' ? 'Collection' : 'Folder'}
                </Typography>
            </DialogTitle>
            
            <Box>
                <DialogContent sx={{pt: '8px'}}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label={`${type === 'collection' ? 'Collection' : 'Folder'} Name`}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        fullWidth
                        size="small"
                        required
                        autoFocus
                        error={!!errors.name}
                        helperText={errors.name}
                        placeholder={type === 'collection' ? 'e.g., User Authentication' : 'e.g., Login User'}
                    />

                    {type === 'request' && (
                        <>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>Method</InputLabel>
                                    <Select
                                        value={formData.method}
                                        onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                                        label="Method"
                                    >
                                        {httpMethods.map((method) => (
                                            <MenuItem key={method} value={method}>
                                                {method}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <TextField
                                    label="URL"
                                    value={formData.url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                    fullWidth
                                    required
                                    error={!!errors.url}
                                    helperText={errors.url || 'e.g., /api/auth/login'}
                                    placeholder="/api/endpoint"
                                />
                            </Box>
                        </>
                    )}

                    <TextField
                        label="Description (Optional)"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        placeholder={`Describe this ${type}...`}
                    />
                </Box>
            </DialogContent>
            </Box>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={loading || !formData.name.trim()}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? 'Creating...' : `Create ${type === 'collection' ? 'Collection' : 'Request'}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
