import React, { useState, useEffect, use } from 'react';
import { Box, Typography, alpha, Snackbar, Alert, } from '@mui/material';
import { SearchBar } from './SerachBar.jsx';
import { CollectionTree } from './Collectiontree.jsx';
import { CreateDialog } from './CreateDialog.jsx';
import { useApp } from '../../ContextApi/AppContext.jsx';
import ImportButton from './ImportButton.jsx';
import { collectionController } from '../../Controller/Collection.js';
import { initialState } from '../../ContextApi/helper/initialState.js';
import { mapApiRequestToState } from '../../ContextApi/helper/mapApiRequestToState.js';
import { itemController } from '../../Controller/items.js';
import { mapStateToApiRequest } from '../../ContextApi/helper/stateTopayload.js';
import { requestController } from '../../Controller/request.js';
import { ActionTypes } from '../../ContextApi/helper/actionTypes.js';
import RenameDialog from './RenameDialog.jsx';



const findItemAndParent = (nodes, nodeId, parent = null) => {
    for (const item of nodes) {
        if (item.id === nodeId) {
            return { item, parent };
        }
        if (item.items) {
            const found = findItemAndParent(item.items, nodeId, item);
            if (found.item) return found;
        }
    }
    return { item: null, parent: null };
};

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

const renameTreeData = (nodes, targetId, transformNode) => {

    return nodes.map(node => {
        if (node.id === targetId) {
            // console.log(node);
            return transformNode(node);
        }
        if (node.items) {

            const updatedChildren = renameTreeData(node.items, targetId, transformNode);

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




export const CollectionsSidebar = ({ onItemSelect }) => {

    const { dispatch, addTab, tabs, setActiveTabId, selectedItem, setSelectedItem,
         handleTabChange, selectedWorkspace, 
         setSelectedWorkspace , addRunnerTab , 
    } = useApp();
    const [collections, setCollections] = useState([]);
    const [activePathIds, setActivePathIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [expandedItems, setExpandedItems] = useState({});
    const [loadingItems, setLoadingItems] = useState({});

    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameTarget, setRenameTarget] = useState(null);

    const [createDialog, setCreateDialog] = useState({
        open: false, type: null, parentId: null, loading: false
    });

    const [notification, setNotification] = useState({
        open: false, message: '', severity: 'success'
    });

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log(collections)
    useEffect(() => {
        if (selectedWorkspace) {
            loadTopLevelCollections(selectedWorkspace.id);
        } else {
            setCollections([]);
            setSelectedItem(null);
            setActivePathIds(new Set());
        }
    }, [selectedWorkspace]);

    // useEffect(()=>{
    //     fetchChildren(itemId)
    // },[child])


    const handleRenameConfirm = async (newName) => {
        if (!renameTarget) return;
        const item = renameTarget;
        setRenameDialogOpen(false);

        try {
            if (item.request?.id) {
                const requestToUpdate = {
                    ...item.request,
                    name: newName
                };

                const payload = {
                    id: requestToUpdate.id,
                    itemId: requestToUpdate.id,
                    name: requestToUpdate.name,
                    url: {
                        raw: requestToUpdate.url?.raw || "",
                        protocol: requestToUpdate.url?.protocol || "https",
                        host: requestToUpdate.url?.host || [],
                        path: requestToUpdate.url?.path || [],
                        query: requestToUpdate.url?.query || []
                    },
                    method: requestToUpdate.method || "GET",
                    header: (requestToUpdate.header || []).map(h => ({ key: h.key, value: h.value })),
                    body: {
                        mode: requestToUpdate.body?.mode || "raw",
                        raw: requestToUpdate.body?.raw || "{}"
                    },
                    createdAt: requestToUpdate.createdAt || Math.floor(Date.now() / 1000),
                    updatedAt: Math.floor(Date.now() / 1000)
                };

                await requestController.updateRequstwithId(item.request.id, payload);
            }
            else if (item.type === 'folder' && !item.workspaceId) {
                const payload = {
                    id: item.id,
                    name: newName,
                    Description: item.Description
                };
                await itemController.updateItem(payload);
            }
            else if (item.workspaceId) {
                const payload = {
                    collectionId: item.id,
                    name: newName,
                    Description: item.Description
                };
                await collectionController.updateCollection(payload);
            }

            const updatedCollections = renameTreeData(collections, item.id, node => ({
                ...node,
                request: node.request ? { ...node.request, name: newName } : undefined,
                name: node.request ? node.name : newName
            }));
            setCollections(updatedCollections);

            if (item.request?.id) {
                dispatch({
                    type: "SET_NAME",
                    payload: { tabId: item.request.id, value: newName }
                });
            }

            showNotification(`Renamed to "${newName}"`, 'success');
        } catch (err) {
            console.error(err);
            showNotification('Failed to rename item', 'error');
        } finally {
            setRenameTarget(null);
        }
    };

   



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

    const handleItemToggle = (item) => {
        const isCurrentlyExpanded = !!expandedItems[item.id];
        setExpandedItems(prev => ({ ...prev, [item.id]: !isCurrentlyExpanded }));
        if (!isCurrentlyExpanded) {
            fetchChildren(item.id);
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleItemClick = (item) => {
        // console.log(item)
        if (item.request) {
            const tab = Object.values(tabs).find(t => t.id === item.request.id);
            if (tab) {
                setSelectedItem({
                    id: tab.id,
                    name: tab.request?.name || tab.name || "Untitled",
                    type: "request",
                    request: tab.request || null,
                });
            } else {
                setSelectedItem({
                    id: item.request.id,
                    name: item.request?.name || item.name || "Untitled",
                    type: "request",
                    request: item.request || null,
                });
            }
        } else {
            setSelectedItem(item);
        }

        const path = findPathToNode(collections, item.id);
        if (path) {
            setActivePathIds(new Set(path));
        }


        if (item.request !== undefined) {
            dispatch({
                type: ActionTypes.SET_REQUEST_DATA,
                payload: item.request,
            });

            const mapdata = mapApiRequestToState(item.request, initialState);
               

            const existingTab = Object.values(tabs).find((tab) => tab.id === item.request.id);

            if (existingTab) {

                handleTabChange(null, existingTab.id);
            } else {

                addTab("", mapdata, item.request.id);
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
                //showNotification(`Sending ${item.method} request to ${item.url}`, 'info');

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
            case 'rename': {
                const currentName = item?.request?.name || item?.name;
                setRenameTarget(item);
                setRenameDialogOpen(true);
                break;
            }



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

                // console.log(formData)
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

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return; // No drop target or item dropped on itself
        }

        setCollections((prevCollections) => {
            // Create a deep copy to avoid mutating the original state
            const newCollections = JSON.parse(JSON.stringify(prevCollections));

            // 1. Find the dragged item and its parent
            const { item: draggedItem, parent: sourceParent } = findItemAndParent(newCollections, active.id);
            
            // 2. Find the drop target item
            const { item: targetItem } = findItemAndParent(newCollections, over.id);

            if (!draggedItem || !targetItem) {
                return prevCollections; // Abort if items not found
            }

            // 3. Remove the item from its original location
            const sourceList = sourceParent ? sourceParent.items : newCollections;
            const sourceIndex = sourceList.findIndex(i => i.id === active.id);
            if (sourceIndex > -1) {
                sourceList.splice(sourceIndex, 1);
            }

            // 4. Determine the new parent and index
            if (targetItem.type === 'folder') {
                // Case 1: Dropping *INTO* a folder
                if (!targetItem.items) {
                    targetItem.items = []; // Ensure 'items' array exists
                }
                // Add to the beginning of the folder's items
                targetItem.items.unshift(draggedItem);
                
                // TODO: Add your API call here to persist the move
                // e.g., itemController.moveItem(active.id, targetItem.id, 0);

            } else {
                // Case 2: Dropping *NEAR* another item (reordering)
                const { parent: targetParent } = findItemAndParent(newCollections, over.id);
                const destList = targetParent ? targetParent.items : newCollections;
                const destIndex = destList.findIndex(i => i.id === over.id);
                
                // Insert the dragged item *before* the target item
                if (destIndex > -1) {
                    destList.splice(destIndex, 0, draggedItem);
                }
                
                // TODO: Add your API call here to persist the move
                // e.g., itemController.moveItem(active.id, targetParent?.id || null, destIndex);
            }

            showNotification(`Moved "${draggedItem.name || draggedItem.request?.name}"`, 'success');
            return newCollections;
        });
    }

    const findItemInTree = (nodes, targetId) => {
        const { item } = findItemAndParent(nodes, targetId);
        return item;
    };

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    backdropFilter: 'blur(20px)',
                    borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    pt: 1
                }}
            >

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
                                onDragEnd={handleDragEnd}
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


            <RenameDialog
                open={renameDialogOpen}
                currentName={renameTarget?.request?.name || renameTarget?.name || ""}
                onClose={() => setRenameDialogOpen(false)}
                onConfirm={handleRenameConfirm}
            />

        </>


    );
};