import React, { useState, useEffect } from 'react';
import { Box, Typography, alpha, Snackbar, Alert, } from '@mui/material';
import { WorkspaceSelector } from './WorkspaceSelector.jsx';
import { SearchBar } from './SerachBar.jsx';
import { CollectionTree } from './Collectiontree.jsx';
import { CreateDialog } from './CreateDialog.jsx';
import { useResizable } from '../../ContextApi/useResizable.js';
// import { useApp, ActionTypes } from '../../ContextApi/AppContext.jsx';
import ImportButton from './ImportButton.jsx';
import { collectionController } from '../../Controller/Collection.js';
import { initialState } from '../../ContextApi/helper/initialState.js';
import { mapApiRequestToState } from '../../ContextApi/helper/mapApiRequestToState.js';
import { itemController } from '../../Controller/items.js';
import { mapStateToApiRequest } from '../../ContextApi/helper/stateTopayload.js';
import { requestController } from '../../Controller/request.js';
import { useAppStore } from '../../Store/useAppStore.js';
import { useWhyDidYouUpdate } from '../../utils/checkRerender.js';


const findPathToNode = (nodes, targetId, currentPath = []) => {
    for (const node of nodes) {
        const path = [...currentPath, node.id];
        if (node.id === targetId) {
            return path;
        }
        if (node.items) {
            const foundPath = findPathToNode(node.items, targetId, path);
            if (foundPath) {
                return foundPath;
            }
        }
    }
    return null;
};




const updateTreeData = (nodes, targetId, newChildren) => {
    return nodes.map(node => {
        if (node.id === targetId) {
            return { ...node, items: newChildren };
        }
        if (node.items) {
            const updatedChildren = updateTreeData(node.items, targetId, newChildren);
            if (updatedChildren !== node.items) {
                return { ...node, items: updatedChildren };
            }
        }
        return node;
    });
};

function deleteItemFromTree(tree, itemId) {
    return tree
        .map(node => {
            if (node.id === itemId) {
                return null;
            }

            if (node.items && node.items.length > 0) {
                return {
                    ...node,
                    items: deleteItemFromTree(node.items, itemId)
                };
            }

            return node;
        })
        .filter(Boolean);
}




export const Sidebar = ({ onItemSelect }) => {
    const { width: sidebarWidth, resizerProps } = useResizable({
        initialWidth: 320,
        minWidth: 240,
        maxWidth: 600
    });

    //const { dispatch, addTab, tabs, setActiveTabId, setSelItem, selectedWorkspace, setSelectedWorkspace } = useApp();

    const tabs = useAppStore((state) => state.tabs);
    const addTab = useAppStore((state) => state.addTab);
    const setActiveTabId = useAppStore((state) => state.handleTabChange);
    const setSelItem = useAppStore((state) => state.setSelItem);
    const selectedWorkspace = useAppStore((state) => state.selectedWorkspace);
    const setSelectedWorkspace = useAppStore((state) => state.setSelectedWorkspace);
    const addRunnerTab = useAppStore((state) => state.addRunnerTab)



    const [collections, setCollections] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [activePathIds, setActivePathIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [expandedItems, setExpandedItems] = useState({});
    const [loadingItems, setLoadingItems] = useState({});

    const [createDialog, setCreateDialog] = useState({
        open: false, type: null, parentId: null, loading: false
    });

    const [notification, setNotification] = useState({
        open: false, message: '', severity: 'success'
    });

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // useWhyDidYouUpdate("sidebar", {tabs , activePathIds})

    useEffect(() => {
        if (selectedWorkspace) {
            loadTopLevelCollections(selectedWorkspace.id);
        } else {
            setCollections([]);
            setSelectedItem(null);
            setActivePathIds(new Set());
        }
    }, [selectedWorkspace]);


    const loadTopLevelCollections = async (workspaceId) => {
        setLoading(true);
        setError(null);
        setCollections([]);
        setExpandedItems({});
        try {
            const data = await collectionController.loadTopLevelCollections(workspaceId);
            setCollections(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchChildren = async (itemId) => {
        setLoadingItems(prev => ({ ...prev, [itemId]: true }));
        try {
            const data = await collectionController.fetchChildren(itemId);
            setCollections(currentCollections =>
                updateTreeData(currentCollections, itemId, data)
            );
        } catch (error) {
            showNotification(error.message, "error");
        } finally {
            setLoadingItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    // const handleItemToggle = (item) => {
    //     const isCurrentlyExpanded = !!expandedItems[item.id];
    //     setExpandedItems(prev => ({ ...prev, [item.id]: !isCurrentlyExpanded }));
    //     if (!isCurrentlyExpanded) {
    //         fetchChildren(item.id);
    //     }
    // };
    const handleItemToggle = (item) => {
        const isCurrentlyExpanded = !!expandedItems[item.id];

        if (isCurrentlyExpanded) {

            setExpandedItems(prev => {
                const newState = { ...prev };
                const collapseRecursively = (id) => {
                    delete newState[id];
                    const childIds = updateTreeData[id] || [];
                    childIds.forEach(collapseRecursively);
                };
                collapseRecursively(item.id);

                setExpandedItems(newState);
                return newState;
            });
        } else {
            setExpandedItems(prev => ({ ...prev, [item.id]: true }));
            fetchChildren(item.id);
        }
    };


    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleItemClick = (item) => {
        
        setSelectedItem(item);
        // onItemSelect?.(item);
        setSelItem(item);

        const path = findPathToNode(collections, item.id);
        if (path) {
            setActivePathIds(new Set(path));
        }

        if (item.request !== undefined) {
            const mapdata = mapApiRequestToState(item.request, initialState);

            const existingTab = tabs.find(tab => tab.id === item.id);
            if (existingTab) {
                setActiveTabId(event, existingTab.id);
            } else {
                addTab({ id: item.id, ...mapdata });
            }
        }
    };
    const handleItemAction = async (action, item) => {
        switch (action) {
            case "add-request":
                try {
                    const payload = mapStateToApiRequest(initialState)


                    let result;
                    if (item.workspaceId) {
                        result = await requestController.createItemWithCollectionId(
                            item.id,
                            payload
                        );
                        fetchChildren(item.id)
                    } else {

                        result = await requestController.createItemWithItemId(
                            item.id,
                            payload
                        );
                        fetchChildren(item.id)
                    }

                    console.log("Request created:", result);
                    return result;
                } catch (error) {
                    console.error("Error in add-request:", error);
                }
                break;
            case 'add-folder':
                setCreateDialog({
                    open: true,
                    type: 'collection',
                    parentId: item.id,
                    item: item,
                    loading: false
                });
                break;

            case 'add-folder-item':
                setCreateDialog({
                    open: true,
                    type: 'add-folder',
                    parentId: item.id,
                    loading: false
                });
                break;

            case 'run':
                showNotification(`Sending ${item.method} request to ${item.url}`, 'info');

                try {
                   
                    const requests = await itemController.getAllItemRequest(item.id);

                    addRunnerTab(item, requests);
                } catch (error) {
                    console.error(error);
                    showNotification(`Failed to load requests: ${error.message}`, 'error');
                }
                break;

            // case 'duplicate':
            //     showNotification(`Duplicating ${item.name}`, 'info');
            //     break;
            case 'rename':
                showNotification('Rename functionality coming soon', 'info');
                break;
            case 'delete-collection':
                if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                    try {
                        await collectionController.delete(item.id)
                        showNotification(`${item.name} deleted successfully`);
                        const updatedCollections = deleteItemFromTree(collections, item.id);
                        setCollections(updatedCollections);
                    } catch (error) {
                        showNotification('Failed to delete item', 'error');
                    }
                }
                break;
            case 'delete-folder':
                if (window.confirm(`Are you sure you want to delete folder "${item.name}"?`)) {
                    try {
                        // console.log(collections)
                        await itemController.deleteItem(item.id)
                        showNotification(`${item.name} deleted successfully`);
                        const updatedCollections = deleteItemFromTree(collections, item.id);
                        setCollections(updatedCollections);

                    } catch (error) {
                        showNotification('Failed to delete item', 'error');
                    }
                }
                break;
            default:
                console.warn('Unknown action:', action);
        }
    };

    const handleCreateCollection = () => {
        setCreateDialog({ open: true, type: 'collection', parentId: null, loading: false });
    };

    const handleCreateRequest = () => {
        setCreateDialog({ open: true, type: 'request', parentId: null, loading: false });
    };

    const handleCreateSubmit = async (formData) => {
        setCreateDialog(prev => ({ ...prev, loading: true }));
        try {
            if (formData.type === 'collection') {
                formData.type = 'folder';
                formData.workspaceId = selectedWorkspace.id;
                await collectionController.createCollection(formData);
                showNotification(`Collection "${formData.name}" created successfully`);
                loadTopLevelCollections(selectedWorkspace.id);
            } else {

                console.log(formData)
                await itemController.createItem(formData);
                showNotification(`Request "${formData.name}" created successfully`);
            }
            setCreateDialog({ open: false, type: null, parentId: null, loading: false });
            fetchChildren(formData.parentId);
        } catch (error) {
            console.error('Failed to create item:', error);
            showNotification('Failed to create item', 'error');
        } finally {
            setCreateDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleNotificationClose = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Box
                sx={{
                    width: sidebarWidth,
                    minWidth: sidebarWidth,
                    maxWidth: sidebarWidth,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    bgcolor: (theme) => theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.paper, 0.95)
                        : 'rgba(250, 251, 252, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                }}
            >
                <WorkspaceSelector
                    collections={collections}
                    onWorkspaceSelect={setSelectedWorkspace}
                    selectedWorkspace={selectedWorkspace}
                />

                <ImportButton
                    selectedWorkspace={selectedWorkspace}
                    loadTopLevelCollections={loadTopLevelCollections}
                />

                {selectedWorkspace ? (
                    <>
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onCreateCollection={handleCreateCollection}
                            onCreateRequest={handleCreateRequest}
                            disabled={loading}
                        />
                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            <CollectionTree
                                collections={filteredCollections}
                                onItemClick={handleItemClick}
                                onItemAction={handleItemAction}
                                selectedItem={selectedItem}
                                activePathIds={activePathIds}
                                loading={loading}
                                error={error}
                                expandedItems={expandedItems}
                                loadingItems={loadingItems}
                                onItemToggle={handleItemToggle}
                            />
                        </Box>
                    </>
                ) : (
                    <Box
                        sx={{
                            flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', textAlign: 'center'
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            Welcome to API Explorer
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Select a workspace to manage collections
                        </Typography>
                    </Box>
                )}

                <Box
                    {...resizerProps}
                    sx={{
                        width: '5px', cursor: 'col-resize', position: 'absolute',
                        top: 0, right: 0, bottom: 0, backgroundColor: 'transparent',
                        '&:hover': { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }
                    }}
                />
            </Box>

            <CreateDialog
                open={createDialog.open}
                onClose={() => setCreateDialog({ open: false, type: null, parentId: null, loading: false })}
                onCreate={handleCreateSubmit}
                type={createDialog.type}
                parentId={createDialog.parentId}
                loading={createDialog.loading}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};