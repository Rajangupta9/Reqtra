import React, { useState } from 'react';
import { Box, CssBaseline, useTheme, alpha, Typography, Button } from '@mui/material';
import { CollectionsSidebar } from '../Components/Sidebar/sidebar';
import { Navbar } from '../Components/Navbar/Navbar';
import RequestHeader from '../Components/Dashboard/PlayGround/RequestHeader';
import RequestTabs from '../Components/Dashboard/PlayGround/RequestTabs';
import ResponseViewer from '../Components/Dashboard/PlayGround/ResponseViewer';
import { useResizable } from '../ContextApi/useResizable';
import ScrollableTabsButtonVisible from '../Components/Dashboard/Tabs';
import { useApp } from '../ContextApi/AppContext';
import { RunnerTab } from '../Components/Dashboard/RunnerTab/RunnerTab';
import ReportComponent from '../Components/Dashboard/Report/Report';
import { PostmanStyleSidebar } from '../Components/Sidebar/sidebarMenu';
import { EnvironmentPanel } from '../Components/Sidebar/EnviornmentPanel';
import { HistoryPanel } from '../Components/Sidebar/HistoryPanel';
import { AddRounded } from '@mui/icons-material';

const NAVBAR_HEIGHT = 56;
const TABS_HEIGHT = 44;
const ACTIVITY_BAR_WIDTH = 52;

export default function AppLayout() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { tabs, activeTabData, addTab } = useApp();
  const hasTabs = Object.keys(tabs).length > 0;
  const [sidebarView, setSidebarView] = useState('collections');

  const { width: sidebarWidth, resizerProps: sidebarResizerProps } = useResizable({
    initialWidth: 280,
    minWidth: 220,
    maxWidth: 560,
  });

  const { width: responseWidth, resizerProps: responseResizerProps } = useResizable({
    initialWidth: 540,
    minWidth: 360,
    maxWidth: 860,
    handleDirection: 'left',
  });

  return (
    <>
      <CssBaseline />
      <Navbar />

      <Box sx={{ display: 'flex', height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, overflow: 'hidden' }}>

        {/* Activity Bar */}
        <PostmanStyleSidebar onViewChange={setSidebarView} />

        {/* Resizable Sidebar */}
        <Box
          sx={{
            width: sidebarWidth,
            minWidth: sidebarWidth,
            maxWidth: sidebarWidth,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRight: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
            {sidebarView === 'collections' && <CollectionsSidebar />}
            {sidebarView === 'environments' && <EnvironmentPanel />}
            {sidebarView === 'history' && <HistoryPanel />}
          </Box>

          {/* Sidebar resize handle */}
          <Box
            {...sidebarResizerProps}
            sx={{
              width: '4px',
              cursor: 'col-resize',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              transition: 'background-color 0.15s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
              },
            }}
          />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Tab strip */}
          <Box sx={{ height: TABS_HEIGHT, flexShrink: 0 }}>
            <ScrollableTabsButtonVisible />
          </Box>

          {/* Content area */}
          <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {hasTabs && activeTabData?.url !== undefined ? (
              <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', minHeight: 0 }}>

                {/* Request editor */}
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    overflow: 'hidden',
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ flexShrink: 0, mb: 1 }}>
                    <RequestHeader />
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
                    <RequestTabs />
                  </Box>
                </Box>

                {/* Resizer */}
                <Box
                  {...responseResizerProps}
                  sx={{
                    width: '4px',
                    cursor: 'col-resize',
                    flexShrink: 0,
                    alignSelf: 'stretch',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  }}
                />

                {/* Response panel */}
                <Box
                  sx={{
                    width: responseWidth,
                    minWidth: responseWidth,
                    maxWidth: responseWidth,
                    flexShrink: 0,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: isDark ? alpha('#000', 0.1) : alpha('#000', 0.01),
                  }}
                >
                  <ResponseViewer />
                </Box>
              </Box>

            ) : hasTabs && activeTabData?.requests !== undefined ? (
              <Box sx={{ flexGrow: 1, height: '100%', overflow: 'auto' }}>
                <RunnerTab />
              </Box>

            ) : hasTabs ? (
              <Box sx={{ flexGrow: 1, height: '100%', overflow: 'auto', p: 2 }}>
                <ReportComponent />
              </Box>

            ) : (
              /* Empty state */
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isDark ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  }}
                >
                  <img
                    src="Vector.svg"
                    alt=""
                    style={{ width: 28, height: 28, opacity: 0.7 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: 'text.primary', mb: 0.75 }}
                  >
                    Start building
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, lineHeight: 1.6 }}>
                    Open a request from the sidebar or create a new one to get started.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddRounded sx={{ fontSize: '16px !important' }} />}
                  onClick={addTab}
                  sx={{ height: 34, px: 2 }}
                >
                  New request
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
