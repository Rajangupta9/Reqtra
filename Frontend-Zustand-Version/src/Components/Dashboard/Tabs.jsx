import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { Typography } from "@mui/material";
import { useAppStore } from "../../Store/useAppStore";


export default function PostmanLikeTabs() {
  const tabs = useAppStore((state) => state.tabs);
  const activeTabId = useAppStore((state) => state.activeTabId);
  const handleTabChange = useAppStore((state) => state.handleTabChange);
  const addTab = useAppStore((state) => state.addTab);
  const closeTab = useAppStore((state) => state.closeTab);
  const closeAllTabs = useAppStore((state) => state.closeAllTabs);


 

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        pr: 4,
        borderRadius: "4px",
        height:"50px",
        position:'sticky'
      }}
    >
      <Tabs
        value={activeTabId}
        onChange={(e, newTabId) => handleTabChange(e ,newTabId)}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        aria-label="Postman-like scrollable tabs"
        sx={{
          flexGrow: 1,
          [`& .${tabsClasses.scrollButtons}`]: {
            "&.Mui-disabled": { opacity: 0.3 },
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            component="div"
            sx={{
              px: "4px",
              textTransform: "none",
              minHeight: "auto",
              maxWidth: "100",
              minWidth: "100",
            }}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography
                  noWrap
                  fontSize={"15px"}
                  sx={{
                    maxWidth: 110,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.name}
                </Typography>

                <IconButton
                  size="small"
                  className="close-icon"
                  onClick={(e) => closeTab(tab.id)}
                  sx={{
                    p: "2px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Box>
            }
          />
        ))}
      </Tabs>

      <IconButton
        onClick={addTab}
        sx={{
          mx: 1,
          flexShrink: 0,
        }}
      >
        <AddIcon color="text.primary" />
      </IconButton>
      <IconButton onClick={closeAllTabs}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}
