import React, { useEffect, useMemo } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import ParamsTab from "./ParamsTab";
import AuthorizationTab from "./AuthorizationTab";
import HeadersTab from "./HeaderTab";
import BodyTab from "./BodyTab";
import ScriptsTab from "./ScriptsTab";
import SettingsTab from "./SettingTab";
import { useAppStore } from "../../../Store/useAppStore";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`request-tabpanel-${index}`}
      aria-labelledby={`request-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ minHeight: "300px" }}>{children}</Box>}
    </div>
  );
};

const RequestTabs = () => {
  const method = useAppStore(
    (state) => state.activeTabData()?.request?.method
  );
  const activeTab = useAppStore(
    (state) => state.activeTabData()?.request?.activeTab
  );
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const tabs = useMemo(
    () => [
      { label: "Params", component: <ParamsTab /> },
      { label: "Authorization", component: <AuthorizationTab /> },
      { label: "Headers", component: <HeadersTab /> },
      { label: "Body", component: <BodyTab /> },
      { label: "Scripts", component: <ScriptsTab /> },
      { label: "Settings", component: <SettingsTab /> },
    ],
    []
  );

  useEffect(() => {
    if (!method) return;

    const methodsWithBody = ["POST", "PUT", "PATCH"];
    if (methodsWithBody.includes(method)) {
      const bodyTabIndex = tabs.findIndex((tab) => tab.label === "Body");
      if (bodyTabIndex !== -1 && activeTab !== bodyTabIndex) {
        setActiveTab(bodyTabIndex);
      }
    }
  }, [method, tabs, setActiveTab]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Request Options Tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minWidth: "auto",
              px: 2.5,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.label}
              label={tab.label}
              id={`request-tab-${index}`}
              aria-controls={`request-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <TabPanel key={tab.label} value={activeTab} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default RequestTabs;
