import React, { useState } from 'react';
import { Box, CssBaseline, useTheme, alpha, Typography } from '@mui/material';
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


const NAVBAR_HEIGHT = 66;
const TABS_HEIGHT = 50;
const ACTIVITY_BAR_WIDTH = 60;

export default function AppLayout() {
  const theme = useTheme();
  const { tabs, activeTabData } = useApp();
  const hasTabs = Object.keys(tabs).length > 0;
  const [sidebarView, setSidebarView] = useState('collections');

  const { width: sidebarWidth, resizerProps: sidebarResizerProps } = useResizable({
    initialWidth: 320,
    minWidth: 240,
    maxWidth: 600
  });

  const { width: responseWidth, resizerProps: responseResizerProps } = useResizable({
    initialWidth: 600,
    minWidth: 400,
    maxWidth: 900,
    handleDirection: 'left',
  });

  return (
    <>
      <CssBaseline />
      <Navbar />

      <Box sx={{ display: 'flex', height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
        {/* Activity Bar for selecting sidebar content */}
        <PostmanStyleSidebar onViewChange={setSidebarView} />

        {/* Resizable Sidebar Container */}
        <Box
          sx={{
            width: sidebarWidth,
            minWidth: sidebarWidth,
            maxWidth: sidebarWidth,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Conditionally render sidebar content */}
            {sidebarView === 'collections' && <CollectionsSidebar />}
            {sidebarView === 'environments' && <EnvironmentPanel />}
            {sidebarView === 'history' && <HistoryPanel />}
          </Box>
          <Box
            {...sidebarResizerProps}
            sx={{
              width: '5px',
              cursor: 'col-resize',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
            }}
          />
        </Box>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: `calc(100% - ${sidebarWidth}px - ${ACTIVITY_BAR_WIDTH}px)`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ height: `${TABS_HEIGHT}px`, width: "100%", flexShrink: 0 }}>
            <ScrollableTabsButtonVisible />
          </Box>

          <Box sx={{ flexGrow: 1, height: `calc(100% - ${TABS_HEIGHT}px)`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {hasTabs && activeTabData?.url !== undefined ? (
              <Box sx={{ display: 'flex', flexGrow: 1, height: '100%' }}>
                {/* Request Editor Section */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, overflow: 'hidden' }}>
                  <Box sx={{ flexShrink: 0, mb: 1 }}>
                    <RequestHeader />
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
                    <RequestTabs />
                  </Box>
                </Box>

                {/* Resizer */}
                <Box {...responseResizerProps}
                  sx={{
                    width: '5px', cursor: 'col-resize', backgroundColor: 'transparent',
                    alignSelf: 'stretch', flexShrink: 0,
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                  }}
                />

                {/* Response Viewer Section */}
                <Box sx={{
                  width: responseWidth, minWidth: responseWidth, maxWidth: responseWidth,
                  flexShrink: 0, borderLeft: (theme) => `1px solid ${theme.palette.divider}`, overflow: 'auto',
                }}>
                  <ResponseViewer />
                </Box>
              </Box>
            ) : hasTabs && activeTabData?.requests !== undefined ? (
              <Box sx={{ flexGrow: 1, height: '100%', overflow: 'auto' }}><RunnerTab /></Box>
            ) : hasTabs ? (
              <Box sx={{ flexGrow: 1, height: '100%', overflow: 'auto', p: 2 }}><ReportComponent /></Box>
            ) : (
              <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <img src="Vector.svg" alt="Get started icon" />
                
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

