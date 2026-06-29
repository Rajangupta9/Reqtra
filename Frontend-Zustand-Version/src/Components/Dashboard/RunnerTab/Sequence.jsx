import React, { useState, useCallback, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Divider,
    IconButton,
} from "@mui/material";
import { useAppStore } from "../../../Store/useAppStore";
import RequestListItem from "./RequestListItem";

export const Sequence = (props) => {
    const { requests, setRequests } = props;
    const tabdata = useAppStore((state) => state.activeTabData());

    const [flatRequests, setFlatRequests] = useState([]);
    const [sourceRequests, setSourceRequests] = useState(tabdata.requests || []);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

    const flattenRequests =(items , path = []) =>{
        let flatList= [];
        
        for(const item of items){
            if(item.request && item.type === 'request') {
              flatList.push({
                ...item , folderPath: path,
                checked: item.checked?? true,
              })
            }
            if(item.type === 'folder' && item.children){
                const newPath = [...path , item.name];
               flatList = flatList.concat(flattenRequests(item.children, newPath))
            }
        }
        return flatList;
        
    }

    
    useEffect(() => {
        if (!tabdata?.requests) return;

        const flattened = flattenRequests(tabdata.requests);
        setSourceRequests(tabdata.requests);
        setFlatRequests(flattened);
        setRequests(flattened);
    }, [tabdata, setRequests]);

    //  Drag start
    const handleDragStart = useCallback((e, index) => {
        setDraggedItemIndex(index);

        e.dataTransfer.effectAllowed = "move";

        const dragNode = e.currentTarget.parentElement;
        if (dragNode) {
            const clone = dragNode.cloneNode(true);
            clone.style.position = "absolute";
            clone.style.top = "-9999px";
            clone.style.width = `${dragNode.offsetWidth}px`;
            clone.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
            clone.style.opacity = "0.1";
            document.body.appendChild(clone);
            e.dataTransfer.setDragImage(clone, 20, 20);
            setTimeout(() => document.body.removeChild(clone), 0);
        }
    }, []);

    // Drag enter
    const handleDragEnter = useCallback((e, index) => {
        e.preventDefault();
        setDragOverItemIndex(index);
    }, []);

    // Drag over
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    //  Drop logic
    const handleDrop = useCallback(() => {
        if (
            draggedItemIndex === null ||
            dragOverItemIndex === null ||
            draggedItemIndex === dragOverItemIndex
        ) {
            setDraggedItemIndex(null);
            setDragOverItemIndex(null);
            return;
        }

        const updatedRequests = [...flatRequests];
        const [draggedItem] = updatedRequests.splice(draggedItemIndex, 1);
        updatedRequests.splice(dragOverItemIndex, 0, draggedItem);

        setFlatRequests(updatedRequests);
        setRequests(updatedRequests);
        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    }, [draggedItemIndex, dragOverItemIndex, flatRequests, setRequests]);

    const handleDragEnd = useCallback(() => {
        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    }, []);

   
    const handleSelectAll = () => {
        const updated = flatRequests.map((r) => ({ ...r, checked: true }));
        setFlatRequests(updated);
        setRequests(updated);
    };

    const handleDeselectAll = () => {
        const updated = flatRequests.map((r) => ({ ...r, checked: false }));
        setFlatRequests(updated);
        setRequests(updated);
    };

    const handleReset = () => {
        const flattened = flattenRequests(sourceRequests);
        const updated = flattened.map((r) => ({ ...r, checked: true }));
        setFlatRequests(updated);
        setRequests(updated);
    };

    // Toggle single item
    const handleToggle = (requestId) => {
        const updated = flatRequests.map((r) =>
            r.requestId === requestId ? { ...r, checked: !r.checked } : r
        );
        setFlatRequests(updated);
        setRequests(updated);
    };

    return (
        <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    p: 2,
                    borderRight: 1,
                    borderColor: "divider",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Run Sequence
                    </Typography>
                    <Box>
                        <Button
                            size="small"
                            sx={{ textTransform: "none" }}
                            onClick={handleDeselectAll}
                        >
                            Deselect All
                        </Button>
                        <Button
                            size="small"
                            sx={{ textTransform: "none" }}
                            onClick={handleSelectAll}
                        >
                            Select All
                        </Button>
                        <Button
                            size="small"
                            sx={{ textTransform: "none" }}
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* List */}
                <Box
                    sx={{ flex: 1, overflowY: "auto", pr: 1 }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {flatRequests.map((req, index) => (
                        <RequestListItem
                            key={req._id || req.requestId}
                            item={req}
                            index={index}
                            onToggle={() => handleToggle(req.requestId)}
                            checked={req.checked || false}
                            onDragStart={handleDragStart}
                            onDragEnter={handleDragEnter}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedItemIndex === index}
                            isDragOver={dragOverItemIndex === index}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};
