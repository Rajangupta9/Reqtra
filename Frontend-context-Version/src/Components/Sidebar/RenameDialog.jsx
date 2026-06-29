// components/Common/RenameDialog.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from '@mui/material';

const RenameDialog = ({ open, currentName, onClose, onConfirm }) => {
    const [newName, setNewName] = useState(currentName || "");

    useEffect(() => {
        setNewName(currentName || "");
    }, [currentName]);

    const handleConfirm = () => {
        if (!newName.trim() || newName === currentName) {
            onClose();
            return;
        }
        onConfirm(newName.trim());
    };

     useEffect(() => { 
            const handleKeyDown = (e) => {
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    handleConfirm();
                }
            };
    
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [handleConfirm]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    position: 'absolute',
                    top: '15%',          // ✅ moves dialog slightly down from top
                    margin: 0,
                    borderRadius: 2,
                    minWidth: 400,       // optional width
                },
            }}
        >
            <DialogTitle>Rename</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    label="New Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained">
                    Rename
                </Button>
            </DialogActions>
        </Dialog>

    );
};

export default RenameDialog;
