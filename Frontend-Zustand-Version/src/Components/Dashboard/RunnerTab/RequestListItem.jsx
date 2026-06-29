import React from "react";
import { Box, Checkbox, Typography, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FolderIcon from '@mui/icons-material/Folder'; 
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; 
import { getMethodColor } from "../../Common/getMethodColour";
import { FolderOutlined } from "@mui/icons-material";

const RequestListItem = ({
    item,
    index,
    checked,
    onToggle,
    onDragStart,
    onDragEnter,
    onDragEnd,
    isDragging,
    isDragOver,
}) => {
    return (
        <Box
            onDragEnter={(e) => onDragEnter(e, index)}
            sx={{
                display: "flex",
                alignItems: "center",
                mb: 1.5,
                bgcolor: "background.paper",
                borderRadius: 1,
                p: 0.5,
                height: "40px",
                border: isDragOver ? "2px dashed #1976d2" : "1px solid transparent",
                opacity: isDragging ? 0.3 : 1,
                transition: "border 0.2s ease, opacity 0.2s ease",
            }}
        >
            <IconButton
                size="small"
                onDragStart={(e) => onDragStart(e, index)}
                onDragEnd={onDragEnd}
                draggable
                sx={{ cursor: "grab" }}
            >
                <DragIndicatorIcon />
            </IconButton>
            <Checkbox checked={checked} onChange={onToggle} sx={{ p: 1, flexShrink: 0 }} />

         
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'text.secondary', mr: 1 }}>
                {item.folderPath && item.folderPath.map((folderName, i) => (
                    <React.Fragment key={i}>
                        <FolderOutlined sx={{ fontSize: '1.1rem' , color: 'folder' }} />
                        <ChevronRightIcon sx={{ fontSize: '1rem', mx: 0.2 }} />
                    </React.Fragment>
                ))}
            </Box>
            
            {item.request && (
                <Box
                    sx={{
                        width: "70px",
                        fontWeight: "bold",
                        color: getMethodColor(item.request.method),
                        fontSize: "0.75rem",
                        flexShrink: 0,
                        textAlign: "left", 
                    }}
                >
                    {item.request.method}
                </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                    {item.name}
                </Typography>
            </Box>
        </Box>
    );
};

export default RequestListItem; 