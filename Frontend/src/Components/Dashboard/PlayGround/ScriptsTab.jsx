import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  alpha,
} from '@mui/material';
import { Code, Restore, ExpandMore } from '@mui/icons-material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { useColorMode } from '../../../Theme/ThemeContext';
import { useApp } from '../../../ContextApi/AppContext';
import scriptTemplates from './helper/scriptTemplates';

// Tab Panel helper
const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
  </div>
);

const ScriptsTab = () => {
  const { mode } = useColorMode();
  const { activeTabData, setPreRequestScript, setTestScript } = useApp();

  const [preRequestValue, setPreRequestValue] = useState('');
  const [testValue, setTestValue] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Dropdown state
  const [anchorEl, setAnchorEl] = useState(null);

  
  // Sync global data
  useEffect(() => {
    if (activeTabData) {
      setPreRequestValue(activeTabData.preRequestScript || '');
      setTestValue(activeTabData.testScript || '');
    }
  }, [activeTabData?.id]);


  useEffect(() => {
    const timer = setTimeout(() => {
      if (preRequestValue !== (activeTabData?.preRequestScript || '')) {
        setPreRequestScript(preRequestValue);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [preRequestValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (testValue !== (activeTabData?.testScript || '')) {
        setTestScript(testValue);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [testValue]);

  // --- Dropdown Logic ---
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleSelectScript = (script) => {
    // Direct insert without dialog
    if (script.type === "pre") setPreRequestValue(script.code);
    else setTestValue(script.code);
    handleCloseMenu();
  };

  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
        Scripts
      </Typography>

      {/* <Card elevation={0} sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip icon={<Code />} label="JavaScript" size="small" color="primary" variant="outlined" />
            <Chip label="Postman API Available" size="small" color="info" variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Write or insert prebuilt JavaScript scripts to execute before or after requests.
          </Typography>
        </CardContent>
      </Card> */}

      <Box sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2, mt: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Pre-request Script" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Post-request Script" sx={{ textTransform: 'none', fontWeight: 500 }} />
        </Tabs>

        {/* --- Pre-request --- */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              endIcon={<ExpandMore />}
              size="small"
              onClick={handleOpenMenu}
            >
              Insert Example
            </Button>
            <Button startIcon={<Restore />} size="small" onClick={() => setPreRequestValue('')}>
              Clear
            </Button>
          </Box>

          <CodeMirror
            value={preRequestValue}
            height="450px"
            extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
            theme={mode === "dark" ? vscodeDark : vscodeLight}
            onChange={(v) => setPreRequestValue(v)}
          />
        </TabPanel>

        {/* --- Post-request --- */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              endIcon={<ExpandMore />}
              size="small"
              onClick={handleOpenMenu}
            >
              Insert Example
            </Button>
            <Button startIcon={<Restore />} size="small" onClick={() => setTestValue('')}>
              Clear
            </Button>
          </Box>

          <CodeMirror
            value={testValue}
            height="450px"
            extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
            theme={mode === "dark" ? vscodeDark : vscodeLight}
            onChange={(v) => setTestValue(v)}
          />
        </TabPanel>
      </Box>

      {/* --- Dropdown Menu --- */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {scriptTemplates
          .filter((s) => (activeTab === 0 ? s.type === "pre" : s.type === "post"))
          .map((script, i) => (
            <MenuItem key={i} onClick={() => handleSelectScript(script)}>
              {script.name}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};

export default ScriptsTab;
