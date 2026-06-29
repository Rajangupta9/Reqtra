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
import { Public, PublicOutlined, TableRowsOutlined } from "@mui/icons-material";
import { useApp } from "../../ContextApi/AppContext";
import EnvironmentDrawer from "./PlayGround/EnvironmentDrawer";
import { getMethodColor } from "../Common/getMethodColour";

export default function PostmanLikeTabs() {
  const theme = useTheme();
  const [envDrawerOpen, setEnvDrawerOpen] = useState(false);
  const { tabs, activeTabId, handleTabChange, addTab, closeTab, closeAllTabs } = useApp();

  const tabList = Object.values(tabs || []);

  const renderMethodBadge = (method) => (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        fontSize: "10px",
        px: "5px",
        py: "2px",
        borderRadius: "4px",
        color: getMethodColor(method),
        bgcolor: alpha(getMethodColor(method), 0.15),
        textTransform: "uppercase",
      }}
    >
      {method || "GET"}
    </Typography>
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        bgcolor: theme.palette.background.paper,
        height: 50,
        gap: 1,
        pr: 2,
      }}
    >
      {/* Tabs */}
      <Tabs
        value={activeTabId || false}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          
          flexGrow: 1,
          minHeight: "100%",
          [`& .${tabsClasses.indicator}`]: {
            height: "3px",
            borderRadius: "2px 2px 0 0",
            backgroundColor: theme.palette.primary.main,
          },
        }}
      >
        {tabList.map((tab, index) => (
          <Tab
            key={tab.id}
            value={tab.id}
            component="div"
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
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
                    fontSize: "13px",
                  }}
                >
                  {tab.name || "Untitled"}
                </Typography>
                <Tooltip title="Close Tab" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(e, tab.id);
                    }}
                    sx={{
                      p: "2px",
                      opacity: 0.5,
                      "&:hover": {
                        opacity: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            }
            sx={{
              textTransform: "none",
              minWidth: 160,
              maxWidth: 160,
              height: "100%",
              // borderRight: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderBottom: "3px solid transparent",
              fontWeight: 500,
              color: theme.palette.text.secondary,
              "&.Mui-selected": {
                color: theme.palette.primary.main,
                borderBottomColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          />
        ))}
      </Tabs>

      {/* Environment Button */}
      <Button
        size="small"
        startIcon={<TableRowsOutlined fontSize="small" />}
        onClick={() => setEnvDrawerOpen(true)}
        sx={{
          textTransform: "none",
          fontWeight: 500,
          fontSize: "13px",
          borderRadius: "6px",
          px: 1.5,
          height: 32,
          color: theme.palette.text.primary,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        Env
      </Button>

      {/* Add Tab */}
      <Tooltip title="New Tab" arrow>
        <IconButton
          onClick={addTab}
          sx={{
            mx: 0.5,
            borderRadius: "6px",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Close All Tabs */}
      <Tooltip title="Close All Tabs" arrow>
        <IconButton
          onClick={closeAllTabs}
          sx={{
            borderRadius: "6px",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <EnvironmentDrawer
        open={envDrawerOpen}
        onClose={() => setEnvDrawerOpen(false)}
      />
    </Box>
  );
}
