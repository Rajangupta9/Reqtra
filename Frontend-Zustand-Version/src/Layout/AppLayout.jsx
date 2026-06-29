import React, { useState } from 'react';
import { Box, CssBaseline, useTheme, alpha } from '@mui/material';
import { Sidebar } from '../Components/Sidebar/sidebar';
import { Navbar } from '../Components/Navbar/Navbar';
import RequestHeader from '../Components/Dashboard/PlayGround/RequestHeader';
import RequestTabs from '../Components/Dashboard/PlayGround/RequestTabs';
import ResponseViewer from '../Components/Dashboard/PlayGround/ResponseViewer';
import { useResizable } from '../ContextApi/useResizable';
import ScrollableTabsButtonVisible from '../Components/Dashboard/Tabs';
import { useAppStore } from '../Store/useAppStore';
import { RunnerTab } from '../Components/Dashboard/RunnerTab/RunnerTab';
import ReportComponent from '../Components/Dashboard/Report/Report';

const navbarHeight = 66;

export default function AppLayout() {
 
    const [requests, setRequests] = useState([])


    const theme = useTheme();
    const tabs = useAppStore((state) => state.tabs);
    const activeTabData = useAppStore((state) => state.activeTabData());
    const { width: responseWidth, resizerProps: responseResizerProps } = useResizable({
        initialWidth: 600,
        minWidth: 400,
        maxWidth: 900,
        handleDirection: 'left'
    });

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    return (
        <>
            <CssBaseline />
            <Navbar handleDrawerToggle={handleDrawerToggle} />

            <Box sx={{ display: 'flex', height: `calc(100vh - ${navbarHeight}px)` }}>
                <Sidebar onItemSelect={(item) => console.log("Item Selected:", item)} />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: '100%',
                        height: '100%',
                        overflow: 'auto'
                    }}
                >
                    <ScrollableTabsButtonVisible />
                    {tabs.length>0 && activeTabData.request !== undefined ? (<Box sx={{ display: 'flex' , height:'calc(100% - 50px)' }}>
                        {/* Left section */}
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                p: 2,
                                overflow: 'auto',
                            }}
                        >
                            {tabs.length > 0 && (
                                <>
                                    <RequestHeader />
                                    <RequestTabs />
                                </>
                            )}
                        </Box>

                        {/* Resizer */}
                        <Box
                            {...responseResizerProps}
                            sx={{
                                width: '5px',
                                cursor: 'col-resize',
                                backgroundColor: 'transparent',
                                alignSelf: 'stretch',
                                flexShrink: 0,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                },
                            }}
                        />

                        
                        <Box
                            sx={{
                                width: responseWidth,
                                minWidth: responseWidth,
                                maxWidth: responseWidth,
                                flexShrink: 0,
                                p: 2,
                                pb:1,
                                borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                                overflow: 'auto',
                            }}
                        >
                            {tabs.length > 0 && <ResponseViewer />}
                        </Box>
                    </Box>): tabs.length > 0 && activeTabData?.requests !== undefined ? (
                        //  RunnerTab View
                        <RunnerTab requests={requests} setRequests={setRequests} />
                        
                    ) : tabs.length > 0 ? (
                        // Report View
                        <Box sx={{ height: 'calc(100% - 50px)' }}>
                            <ReportComponent />
                            <></>
                        </Box>
                    ) : null}
                    
                </Box>
            </Box>
        </>
    );
}
