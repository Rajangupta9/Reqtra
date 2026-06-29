import React, { useState } from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Typography, Menu, MenuItem, Divider, Box, List, alpha, Tooltip, Chip, CircularProgress } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowRight, FolderOutlined, MoreVert, PostAdd, CreateNewFolder, PlayArrow, Edit, Delete, ContentCopy, CreateNewFolderOutlined, PlayArrowOutlined, EditOutlined, PostAddOutlined, DeleteOutline } from '@mui/icons-material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'; 
import { useSortable } from '@dnd-kit/sortable'; 
import { CSS } from '@dnd-kit/utilities';
import { getMethodColor } from '../Common/getMethodColour';

export const CollectionTreeItem = React.memo((props) => {
    const {
        item,
        level = 0,
        onItemClick,
        onItemAction,
        selectedItem,
        activePathIds,
        expandedItems,
        loadingItems,
        onItemToggle
    } = props;

    const [menuAnchor, setMenuAnchor] = useState(null);

    // dnd-kit hooks
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id }); 

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const isExpanded = !!expandedItems[item.id];
    const isLoading = !!loadingItems[item.id];
    const selectedId = selectedItem?.id;
    const isActuallySelectedItem = selectedId !== undefined && (selectedId === item.request?.id || selectedId === item.id);
    const isInActivePath = !!activePathIds && typeof activePathIds.has === 'function' ? activePathIds.has(item.id) : false;

    const handleToggle = (e) => {
        e.stopPropagation(); 
        if (item.type === 'folder') {
            onItemToggle(item);
        }
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleAction = (action) => {
        onItemClick?.(item);

        if (action === 'delete') {
            if (item.workspaceId) {
                onItemAction?.('delete-collection', item);
            } else {
                onItemAction?.('delete-folder', item);
            }
        } else {
            onItemAction?.(action, item);
        }

        handleMenuClose();
    };

    const handleItemClick = (e) => {
        e.stopPropagation();
        if (item.type === 'folder' && !isExpanded) {
            onItemToggle(item);
        }
        onItemClick?.(item);
    };

    const renderMethodBadge = (method) => (
        <Typography
            variant="caption"
            sx={{
                display: 'inline-block',
                fontWeight: 'bold',
                fontSize: '10px',
                px: '6px',
                py: '2px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
                color: getMethodColor(method),
            }}
        >
            {method?.toUpperCase()}
        </Typography>
    );

    const isFolder = item.type === 'folder';
    const hasChildren = isFolder && item.items !== undefined && item.items.length > 0;
    const canHaveChildren = isFolder;

    return (
        <>
            <ListItem disablePadding ref={setNodeRef} style={style} {...attributes}>
                <ListItemButton
                    onClick={handleItemClick}
                    selected={isActuallySelectedItem}
                    // {...listeners} 
           
                    sx={{
                        pl: 1 + level * 2, pr: 1, py: 0.5,
                        borderRadius: '6px', mx: 0.5, mb: 0.25, minHeight: 'auto',
                        cursor: 'grab',
                        '&:active': {
                            cursor: 'grabbing'
                        },
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.action.hover,
                        },
                        ...(isInActivePath && !isActuallySelectedItem && {
                            backgroundColor: (theme) => theme.palette.action.hover,
                        }),
                        '&.Mui-selected': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.16),
                            '&:hover': {
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.22),
                            }
                        }
                    }}
                >
                    {canHaveChildren ? (
                        <IconButton size="small" onClick={handleToggle} sx={{ p: 0.25, mr: 0.5 }}>
                            {isExpanded ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 22, height: 22, mr: 0.5 }} />
                    )}
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1, color: 'text.secondary' }}>
                        {isFolder ? (
                            <FolderOutlined fontSize="small" sx={{ color: 'folder' }} />
                        ) : (
                            item.request?.method && renderMethodBadge(item.request.method)
                        )}
                    </ListItemIcon>

                    <ListItemText
                        primary={
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '13px',
                                    fontWeight: isFolder ? 550 : 450,
                                    color: isActuallySelectedItem ? 'selected' : 'text.primary',
                                    TextOverflow: 'ellipsis',
                                    overflow: "hidden",
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {isFolder ? item.name : item.request?.name}
                            </Typography>
                        }
                    />
                    <Tooltip title="More actions" placement="top">
                        <IconButton size="small" onClick={handleMenuClick} sx={{ p: 0.25, opacity: 0.6, '&:hover': { opacity: 1 } }}>
                            <MoreVert fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </ListItemButton>
            </ListItem>

            {isFolder && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', pl: 4 + level * 2, py: 1 }}>
                            <CircularProgress size={16} />
                        </Box>
                    ) : hasChildren ? (
                        <SortableContext
                            items={item.items.map(child => child.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <List component="div" disablePadding>
                                {item.items.map((child) => (
                                    <CollectionTreeItem
                                        key={child.id}
                                        item={child}
                                        level={level + 1}
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
                        </SortableContext> 
                        // <-- FIX 2: End of SortableContext
                    ) : item.items?.length === 0 ? (
                        <ListItem sx={{ pl: 4 + level * 2, fontStyle: 'italic', color: 'text.secondary' }}>
                            <Typography variant="body2">Empty folder</Typography>
                        </ListItem>
                    ) : null}
                </Collapse>
            )}

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {isFolder ? [
                    <MenuItem key="add-request" onClick={() => handleAction('add-request')}><PostAddOutlined fontSize="small" sx={{ mr: 1 }} />Add Request</MenuItem>,
                    <MenuItem key="add-folder" onClick={() => handleAction('add-folder-item')}><CreateNewFolderOutlined fontSize="small" sx={{ mr: 1 }} />Add Folder</MenuItem>,
                    <Divider key="divider1" />,
                    <MenuItem key="run" onClick={() => handleAction('run')}><PlayArrowOutlined fontSize="small" sx={{ mr: 1 }} />Run</MenuItem>,
                    <MenuItem key="rename" onClick={() => handleAction('rename')}><EditOutlined fontSize="small" sx={{ mr: 1 }} />Rename</MenuItem>,
                    <Divider key="divider2" />,
                    <MenuItem key="delete-folder" onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}><DeleteOutline fontSize="small" sx={{ mr: 1 }} />Delete Folder</MenuItem>
                ] : [
                    <MenuItem key="rename" onClick={() => handleAction('rename')}><EditOutlined fontSize="small" sx={{ mr: 1 }} />Rename</MenuItem>,
                    <Divider key="divider2" />,
                    <MenuItem key="delete-request" onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}><DeleteOutline fontSize="small" sx={{ mr: 1 }} />Delete Request</MenuItem>
                ]}
            </Menu>
        </>
    );
});