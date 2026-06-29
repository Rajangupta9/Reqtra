import React from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const COLORS = {
  passed: "#4caf50",
  failed: "#f44336",
};

const getMethodColor = (method) => {
  const methodColors = {
    GET: "info",
    POST: "success",
    PUT: "warning",
    DELETE: "error",
  };
  return methodColors[method?.toUpperCase()] || "default";
};


export const TestResultRow = ({ test, isExpanded, onToggle }) => {
  return (
    <React.Fragment>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={1.5}
        onClick={onToggle}
        sx={{
          cursor: "pointer",
          bgcolor:
            test.status === "Failed"
              ? "rgba(244, 67, 54, 0.08)"
              : "transparent",
          "&:hover": {
            bgcolor:
              test.status === "Failed"
                ? "rgba(244, 67, 54, 0.12)"
                : "action.hover",
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} flex={1} minWidth={0}>
          <Chip
            label={test.status}
            color={test.status === "Failed" ? "error" : "success"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Typography noWrap variant="body1" sx={{ fontWeight: 500 }}>
            {test.name}
          </Typography>
          <Chip
            label={test.method}
            color={getMethodColor(test.method)}
            size="small"
          />
          <Typography
            noWrap
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {test.endpoint}
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Chip
            label={test.code}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderColor:
                test.code >= 200 && test.code < 300
                  ? COLORS.passed
                  : COLORS.failed,
              color:
                test.code >= 200 && test.code < 300
                  ? COLORS.passed
                  : COLORS.failed,
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 70, textAlign: "right" }}
          >
            {test.time} ms
          </Typography>
          <IconButton size="small">
            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Box>
      </Box>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box p={2} sx={{ bgcolor: "action.focus", borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Response Body / Error
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: "background.default",
              p: 1.5,
              borderRadius: 1,
              maxHeight: 300,
              overflow: "auto",
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              margin: 0,
            }}
          >
            <code>
              {JSON.stringify(test.error ? { error: test.error } : test.response, null, 2)}
            </code>
          </Box>
        </Box>
      </Collapse>
      <Divider />
    </React.Fragment>
  );
};