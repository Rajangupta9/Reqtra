import React, { useState } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import {
    Add,
    Search,
    FolderOutlined,
    PostAdd,
    Clear
} from '@mui/icons-material';
import { ActionTypes, useApp } from '../../ContextApi/AppContext';

export const SearchBar = ({
    searchTerm,
    onSearchChange,
    onCreateCollection,
    onCreateRequest,
    disabled
}) => {
    const [createMenuAnchor, setCreateMenuAnchor] = useState(null);

    // const {state , dispatch} = useApp()

    const handleCreateClick = (event) => {
        setCreateMenuAnchor(event.currentTarget);
    };

    const handleCreateClose = () => {
        setCreateMenuAnchor(null);
    };

    const handleCreateCollection = () => {
        onCreateCollection?.();
        handleCreateClose();
    };
    // onCreateRequest?.();

    // const handleCreateRequest = () => {

    //     dispatch({type: ActionTypes.RESET_STATE})

    //     handleCreateClose();
    // };

    const handleClearSearch = () => {
        onSearchChange('');
    };

    return (
        <>
            <Box sx={{ p: 1 }}>
                <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                    
                    <Tooltip title="Create new collections" placement="top">
                        <span>
                            <IconButton
                                onClick={handleCreateClick}
                                disabled={disabled}
                                sx={{
                                    height: "35px",
                                    width: "35px",
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'primary.50'
                                    }
                                }}
                            >
                                <Add fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <TextField
                        placeholder='Search Collections'
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        disabled={disabled}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearSearch}
                                            sx={{ p: 0.5 }}
                                        >
                                            <Clear fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: 35,
                                borderRadius: '6px'
                            }
                        }}
                    />
                </Box>
            </Box>

            <Menu
                anchorEl={createMenuAnchor}
                open={Boolean(createMenuAnchor)}
                onClose={handleCreateClose}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleCreateCollection}>
                    <FolderOutlined fontSize="small" sx={{ mr: 1, color: '#FFA726' }} />
                    Create Collection
                </MenuItem>
                {/* <MenuItem onClick={handleCreateRequest}>
                    <PostAdd fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    Create Request
                </MenuItem> */}
            </Menu>
        </>
    );
};