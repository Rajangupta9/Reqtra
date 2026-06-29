import React from 'react';
import {
    List,
    Typography,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { CollectionTreeItem } from './CollectionTreeItems';

export const CollectionTree = ({
    collections,
    onItemClick,
    onItemAction,
    selectedItem,
    activePathIds, 
    loading,
    error,
    expandedItems,
    loadingItems,
    onItemToggle,
}) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Loading collections...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!collections || collections.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No collections found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Create your first collection to organize your API requests
                </Typography>
            </Box>
        );
    }

    return (
        <List dense sx={{ px: 0.5, py: 0 }}>
            {collections.map((collection) => (
                <CollectionTreeItem
                    key={collection.id}
                    item={collection}
                    onItemClick={onItemClick}
                    onItemAction={onItemAction}
                    selectedItem={selectedItem}
                    activePathIds={activePathIds} 
                    expandedItems={expandedItems}
                    loadingItems={loadingItems}
                    onItemToggle={onItemToggle}
                />
            ))}
        </List>
    );
};