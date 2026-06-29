import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Button,
  Typography,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { tabsClasses } from "@mui/material/Tabs";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { TableRowsOutlined } from "@mui/icons-material";
import { useApp } from "../../ContextApi/AppContext";
import EnvironmentDrawer from "./PlayGround/EnvironmentDrawer";
import { getMethodColor } from "../Common/getMethodColour";

export default function PostmanLikeTabs() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [envDrawerOpen, setEnvDrawerOpen] = useState(false);
  const { tabs, activeTabId, handleTabChange, addTab, closeTab, closeAllTabs } = useApp();

  const tabList = Object.values(tabs || []);

  const renderMethodBadge = (method) => (
    <Box
      component="span"
      sx={{
        fontWeight: 700,
        fontSize: '10px',
        letterSpacing: '0.04em',
        lineHeight: 1,
        color: getMethodColor(method),
        fontFamily: '"Inter", monospace',
        flexShrink: 0,
        minWidth: 28,
      }}
    >
      {method || "GET"}
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        height: 44,
        gap: 0.5,
        pr: 1,
      }}
    >
      {/* Scrollable Tabs */}
      <Tabs
        value={activeTabId || false}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          flexGrow: 1,
          minHeight: 44,
          height: 44,
          [`& .${tabsClasses.indicator}`]: {
            height: 2,
            borderRadius: '2px 2px 0 0',
            backgroundColor: theme.palette.primary.main,
          },
          [`& .${tabsClasses.scrollButtons}`]: {
            width: 28,
            '&.Mui-disabled': { opacity: 0.2 },
          },
        }}
      >
        {tabList.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            component="div"
            disableRipple
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                {tab.request?.method && renderMethodBadge(tab.request.method)}
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    flex: 1,
                    color: "inherit",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: 1.3,
                  }}
                >
                  {tab.name || "Untitled"}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(e, tab.id);
                  }}
                  sx={{
                    p: '2px',
                    ml: 0.25,
                    flexShrink: 0,
                    opacity: 0,
                    width: 16,
                    height: 16,
                    borderRadius: '3px',
                    '.MuiTab-root:hover &': { opacity: 0.5 },
                    '.Mui-selected &': { opacity: 0.4 },
                    '&:hover': {
                      opacity: '1 !important',
                      bgcolor: alpha(theme.palette.text.primary, 0.1),
                    },
                    '& .MuiSvgIcon-root': { fontSize: '11px' },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            }
            sx={{
              textTransform: "none",
              minWidth: 140,
              maxWidth: 180,
              height: 44,
              minHeight: 44,
              px: 1.5,
              fontWeight: 500,
              color: theme.palette.text.secondary,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              transition: 'background-color 0.15s ease, color 0.15s ease',
              "&.Mui-selected": {
                color: theme.palette.text.primary,
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.06 : 0.04),
              },
              "&:hover": {
                bgcolor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          />
        ))}
      </Tabs>

      {/* New Tab */}
      <Tooltip title="New tab" arrow>
        <IconButton
          onClick={addTab}
          size="small"
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
              color: theme.palette.text.primary,
            },
          }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      {/* Separator */}
      <Box sx={{ width: '1px', height: 18, bgcolor: theme.palette.divider, mx: 0.5, flexShrink: 0 }} />

      {/* Environment Button */}
      <Tooltip title="Manage environments" arrow>
        <Button
          size="small"
          startIcon={<TableRowsOutlined sx={{ fontSize: '14px !important' }} />}
          onClick={() => setEnvDrawerOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            fontSize: "12px",
            borderRadius: "5px",
            px: 1.25,
            height: 28,
            color: theme.palette.text.secondary,
            border: `1px solid transparent`,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
            },
          }}
        >
          Env
        </Button>
      </Tooltip>

      {/* Close All */}
      <Tooltip title="Close all tabs" arrow>
        <IconButton
          onClick={closeAllTabs}
          size="small"
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
              color: theme.palette.error.main,
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      <EnvironmentDrawer
        open={envDrawerOpen}
        onClose={() => setEnvDrawerOpen(false)}
      />
    </Box>
  );
}
