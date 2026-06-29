import React from "react";
import { Box, Checkbox, Typography, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getMethodColor } from "../../Common/getMethodColour";

const RequestListItem = ({ item, checked, onToggle, dragHandleProps }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 1.5,
        bgcolor: "background.paper",
        borderRadius: 1,
        p: 0.5,
        height: "40px",
        transition: "border 0.2s ease, opacity 0.2s ease",
        boxShadow: "0 0 2px rgba(0,0,0,0.1)",
      }}
    >
   
      <IconButton
        size="small"
        sx={{ cursor: "grab" }}
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
      >
        <DragIndicatorIcon />
      </IconButton>

      <Checkbox
        checked={checked}
        onChange={onToggle}
        sx={{ p: 1, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()} 
      />

      <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", mr: 1 }}>
        {item.folderPath?.map((folder, i) => (
          <React.Fragment key={i}>
            <FolderOutlinedIcon sx={{ fontSize: "1.1rem" }} />
            <ChevronRightIcon sx={{ fontSize: "1rem", mx: 0.2 }} />
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
