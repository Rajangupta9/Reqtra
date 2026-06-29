import React, { useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useApp } from '../../../ContextApi/AppContext';
import ParamsTab from './ParamsTab';
import AuthorizationTab from './AuthorizationTab';
import HeadersTab from './HeaderTab';
import BodyTab from './BodyTab';
import ScriptsTab from './ScriptsTab';
import SettingsTab from './SettingTab';
import { ActionTypes } from '../../../ContextApi/helper/actionTypes';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`request-tabpanel-${index}`}
    aria-labelledby={`request-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ minHeight: '300px' }}>{children}</Box>}
  </div>
);

const RequestTabs = () => {
  const tabs = [
    { label: 'Params', key: 'params', component: <ParamsTab /> },
    { label: 'Authorization', key: 'authorization', component: <AuthorizationTab /> },
    { label: 'Headers', key: 'headers', component: <HeadersTab /> },
    { label: 'Body', key: 'body', component: <BodyTab /> },
    { label: 'Scripts', key: 'scripts', component: <ScriptsTab /> },
    { label: 'Settings', key: 'settings', component: <SettingsTab /> },
  ];

  const { activeTabData, dispatch, activeTabId } = useApp();
  const { activeRequestTab = 0 , method } = activeTabData;

 
  //  Automatically switch to Body tab if method supports body
  useEffect(() => {
    const methodsWithBody = ['POST', 'PUT', 'PATCH'];
    if (methodsWithBody.includes(method)) {
      const bodyTabIndex = tabs.findIndex(tab => tab.label === 'Body');
      if (bodyTabIndex !== -1 && activeRequestTab !== bodyTabIndex) {
        dispatch({
          type: ActionTypes.SET_REQUEST_ACTIVE_TAB,
          payload: { tabId: activeTabId, value: bodyTabIndex },
        });
      }
    }
   
  
  }, [activeTabData.id]);


  const handleTabChange = (event, newValue) => {
    dispatch({
      type: ActionTypes.SET_REQUEST_ACTIVE_TAB,
      payload: { tabId: activeTabId, value: newValue },
    });
  };


  const hasTabData = (key) => {
    if (!activeTabData) return false;

    switch (key) {
      case 'params':
        return Array.isArray(activeTabData.params) && activeTabData.params.some(p => p.key && p.enabled);

      case 'authorization':
        const { authType, authData } = activeTabData;
        if (authType === 'No Auth') return false;
        if (authType === 'API Key') return authData?.apiKey?.key || authData?.apiKey?.value;
        if (authType === 'Bearer Token') return !!authData?.bearerToken;
        if (authType === 'Basic Auth') return authData?.basicAuth?.username || authData?.basicAuth?.password;
        return false;

      case 'headers':
        return Array.isArray(activeTabData.headers) && activeTabData.headers.some(h => h.key && h.enabled);

      case 'body':
        const { bodyType, formData, rawBody, urlEncodedData } = activeTabData;
        if (bodyType === 'formdata')
          return Array.isArray(formData) && formData.some(f => f.key && f.enabled && f.value);
        if (bodyType === 'urlencoded')
          return Array.isArray(urlEncodedData) && urlEncodedData.some(u => u.key && u.enabled && u.value);
        if (bodyType === 'raw')
          return rawBody && rawBody.trim() !== '{}' && rawBody.trim() !== '';
        return false;

    
       case 'scripts':
        const hasPreRequestScript = activeTabData.preRequestScript && activeTabData.preRequestScript.trim() !== '';
        const hasTestScript = activeTabData.testScript && activeTabData.testScript.trim() !== '';
        return hasPreRequestScript || hasTestScript;

      case 'settings':
        // Show dot only if user changed settings from default
        const s = activeTabData.settings;
        if (!s) return false;
        return (
          s.followRedirects !== true ||
          s.validateSSL !== true ||
          s.timeout !== 30000 ||
          s.maxRedirects !== 5
        );

      default:
        return false;
    }
  };

  return (
    <Box >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeRequestTab}
          onChange={handleTabChange}
          aria-label="Request Options Tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 'auto',
              px: 2.5,
              position: 'relative',
            },
          }}
        >
          {tabs.map((tab, index) => {
            const showDot = hasTabData(tab.key);
            return (
              <Tab
                key={tab.label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 , fontSize: "1rem"}}>
                    {tab.label}
                    {showDot && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                        }}
                      />
                    )}
                  </Box>
                }
                id={`request-tab-${index}`}
                aria-controls={`request-tabpanel-${index}`}
              />
            );
          })}
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <TabPanel key={tab.label} value={activeRequestTab} index={index} >
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default RequestTabs;
