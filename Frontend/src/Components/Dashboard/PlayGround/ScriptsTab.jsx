import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Tabs,
  Tab,
  Menu,
  MenuItem,
} from '@mui/material';
import { Restore, ExpandMore } from '@mui/icons-material';
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
      <Box
        sx={{
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            px: 1,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 38,
              '& .MuiTab-root': { minHeight: 38, py: 0, fontSize: '13px' },
            }}
          >
            <Tab label="Pre-request" disableRipple sx={{ textTransform: 'none', fontWeight: 500 }} />
            <Tab label="Post-request" disableRipple sx={{ textTransform: 'none', fontWeight: 500 }} />
          </Tabs>

          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <Button
              variant="outlined"
              endIcon={<ExpandMore sx={{ fontSize: '14px !important' }} />}
              size="small"
              onClick={handleOpenMenu}
              sx={{ fontSize: '11px', height: 26, px: 1.25 }}
            >
              Examples
            </Button>
            <Button
              startIcon={<Restore sx={{ fontSize: '14px !important' }} />}
              size="small"
              onClick={() => activeTab === 0 ? setPreRequestValue('') : setTestValue('')}
              sx={{ fontSize: '11px', height: 26, px: 1.25 }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <CodeMirror
            value={preRequestValue}
            height="360px"
            extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
            theme={mode === "dark" ? vscodeDark : vscodeLight}
            onChange={(v) => setPreRequestValue(v)}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <CodeMirror
            value={testValue}
            height="360px"
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
