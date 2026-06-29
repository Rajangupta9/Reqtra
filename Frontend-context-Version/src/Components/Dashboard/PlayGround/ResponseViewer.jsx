import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, Paper, Chip, Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, List, ListItem, ListItemIcon, ListItemText, AlertTitle } from '@mui/material';
import { ContentCopy, Download, CheckCircle, Error, Warning, Check, Close, SendOutlined, DataObject, DownloadOutlined, CheckCircleOutline, WarningOutlined } from '@mui/icons-material';
import { useApp } from '../../../ContextApi/AppContext';

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useColorMode } from '../../../Theme/ThemeContext';
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { runBasicTests } from './helper/runBasicTests';

const ResponseViewer = () => {
    const { activeTabData } = useApp();
    const { response, responseTime, responseSize, loading, error } = activeTabData;
    const [activeTab, setActiveTab] = useState(0);

    const responseTabHeight = "670px";
    const borderRadius = '0px'

    const { mode } = useColorMode();

    // console.log(response?.testResult);
    if (loading) {
        return (
            <Card elevation={2} sx={{ height: '100%', borderRadius: borderRadius }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                        <DataObject sx={{ fontSize: 36, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Loading response...
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card
                elevation={2}
                sx={{
                    height: "100%",
                    borderRadius: borderRadius,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    p: 2,
                }}
            >
                <CardContent sx={{ textAlign: "center" }}>
                    <Box sx={{ mb: 1 }}>
                        <img
                            src="/networkError.svg"
                            alt="Network Error"
                            style={{ height: 120, objectFit: "contain" }}
                        />
                    </Box>
                    {/* <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {error.type || "Network Error"}
                    </Typography> */}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {error.message || "Something went wrong while processing your request."}
                    </Typography>

                </CardContent>
            </Card>
        );
    }

    if (!response) {
        return (
            <Card
                elevation={2}
                sx={{
                    height: "100%",
                    borderRadius: borderRadius,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CardContent
                    sx={{
                        textAlign: "center",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 6,
                    }}
                >
                    <Box sx={{ mb: 1 }}>
                        <img
                            src="/sendRequest.svg"
                            alt="Send Request"
                            style={{ height: 80, objectFit: "contain" }}
                        />
                    </Box>


                </CardContent>
            </Card>
        );
    }


    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const copyResponse = () => {
        if (response) {

            const responseBody = response.responseInfo?.body || response.data || response;
            const textToCopy = typeof responseBody === 'string'
                ? responseBody
                : JSON.stringify(responseBody, null, 2);
            navigator.clipboard.writeText(textToCopy);
        }
    };

    const downloadResponse = () => {
        if (response) {
            const responseBody = response.responseInfo?.body || response.data || response;
            const textToDownload = typeof responseBody === 'string'
                ? responseBody
                : JSON.stringify(responseBody, null, 2);
            const blob = new Blob([textToDownload], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'response.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const getStatusIcon = (status) => {
        if (status < 300) return <CheckCircleOutline color="success" fontSize="small" />;
        if (status < 400) return <WarningOutlined color="warning" fontSize="small" />;
        return <Error color="error" fontSize="small" />;
    };

    const getStatusColor = (status) => {
        if (status < 300) return 'success';
        if (status < 400) return 'warning';
        return 'error';
    };

    const formatJSON = (data) => {
        try {
            if (typeof data === 'string') {
                const parsed = JSON.parse(data);
                return JSON.stringify(parsed, null, 2);
            }
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    };


    const getTestIcon = (passed) => {
        return passed ? <Check color="success" fontSize="small" /> : <Close color="error" fontSize="small" />;
    };

    const getTestTypeColor = (type) => {
        switch (type) {
            case 'status': return 'primary.main';
            case 'performance': return 'warning.main';
            case 'content': return 'success.main';
            case 'headers': return 'secondary.main';
            default: return 'text.secondary';
        }
    };

    const formatTime = (ms) => {
        if (ms < 1000) {
            return `${ms} ms`;
        } else {
            return `${(ms / 1000).toFixed(2)} s`;
        }
    };


    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const rawTime = response.timingInfo?.durationMs || responseTime;
    const rawSize = response.responseInfo?.bodySize || responseSize;

    const timing = formatTime(rawTime);

    const size = formatSize(rawSize);

    const statusCode = response.responseInfo?.statusCode || response.status;
    const statusText = response.responseInfo?.status || response.statusText || '';
    const headers = response.responseInfo?.headers || response.headers || {};
    const responseBody = response.responseInfo?.body || response.data || response;
    const cookies = " Cookie information is not available in this environment."


    return (
        <Card elevation={2} sx={{ height: "100%", borderRadius: borderRadius }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600 }}>
                            Response
                        </Typography>
                        {statusCode && getStatusIcon(statusCode)}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        {timing != null && (
                            <Chip
                                label={timing}
                                size="small"
                                color="info"
                                variant="outlined"
                            />
                        )}
                        {size && (
                            <Chip
                                label={typeof size === 'number' ? `${size} bytes` : size}
                                size="small"
                                color="info"
                                variant="outlined"
                            />
                        )}
                        {statusCode && (
                            <Chip
                                label={`${statusText}`}
                                size="small"
                                color={getStatusColor(statusCode)}
                                variant="filled"
                            />
                        )}
                        <Button
                            startIcon={<ContentCopy />}
                            onClick={copyResponse}
                            size="small"
                            variant="outlined"
                        >
                            Copy
                        </Button>
                        <Button
                            startIcon={<DownloadOutlined />}
                            onClick={downloadResponse}
                            size="small"
                            variant="outlined"
                        >
                            Download
                        </Button>
                    </Box>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                    <Tab label="Body" />
                    <Tab label="Headers" />
                    <Tab label="Cookies" />
                    <Tab label="Test Results" />
                </Tabs>

                {activeTab === 0 && (
                    <Box>
                        <Paper
                            elevation={0}
                            sx={{
                                // p: 2,
                                bgcolor: 'action.hover',
                                border: '1px solid',
                                borderColor: 'divider',
                                maxHeight: responseTabHeight,
                                overflow: 'auto',
                                wordBreak: 'break-all',
                                borderRadius: '0px'
                            }}
                        >

                            <CodeMirror
                                value={responseBody ? formatJSON(responseBody) : "No response body"}
                                // height="850px"
                                extensions={[json(), EditorView.lineWrapping, EditorState.readOnly.of(true)]}
                                theme={mode === "dark" ? vscodeDark : vscodeLight}
                                style={{
                                    width: "100%",
                                    overflow: "auto",
                                }}
                                basicSetup={{
                                    foldGutter: true,
                                    dropCursor: true,
                                    allowMultipleSelections: false,
                                    indentOnInput: true,
                                }}
                            />

                        </Paper>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ maxHeight: responseTabHeight, overflow: 'auto' }}>
                        {headers && Object.keys(headers).length > 0 ? (
                            <TableContainer
                                component={Paper}
                                elevation={0}
                                sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Header</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(headers).map(([key, value]) => (
                                            <TableRow
                                                key={key}
                                                sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '13px',
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {key}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '13px',
                                                        wordBreak: 'break-all',
                                                    }}
                                                >
                                                    {value}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert severity="info">No response headers received</Alert>
                        )}
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box sx={{ maxHeight: responseTabHeight, overflow: 'auto' }}>
                        <Alert severity="info" sx={{ whiteSpace: 'pre-wrap' }}>
                            {cookies || 'No cookies found'}
                        </Alert>
                    </Box>
                )}

                {activeTab === 3 && (
                    <Box sx={{ maxHeight: responseTabHeight, overflow: 'auto', pr: 1 }}>
                        {(() => {
                            const testResults = response?.testResult || []; // your actual test result array
                            const totalTests = testResults.length;
                            const passedTests = testResults.filter((t) => t.pass).length;

                            if (totalTests === 0) {
                                return (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        No test cases found for this request.
                                    </Alert>
                                );
                            }

                            return (
                                <>
                                    {/* Header Summary */}
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                                                Post-Script Test Results
                                            </Typography>
                                            <Chip
                                                label={`${passedTests}/${totalTests} PASSED`}
                                                color={
                                                    passedTests === totalTests
                                                        ? 'success'
                                                        : passedTests > 0
                                                            ? 'warning'
                                                            : 'error'
                                                }
                                                size="small"
                                            />
                                        </Box>

                                        {/* Progress bar */}
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 8,
                                                bgcolor: 'action.disabledBackground',
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${(passedTests / totalTests) * 100}%`,
                                                    height: '100%',
                                                    bgcolor:
                                                        passedTests === totalTests
                                                            ? 'success.main'
                                                            : passedTests > 0
                                                                ? 'warning.main'
                                                                : 'error.main',
                                                    transition: 'width 0.3s ease',
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* List of Tests */}
                                    <List
                                        sx={{
                                            bgcolor: 'background.paper',
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        {testResults.map((test, index) => (
                                            <React.Fragment key={index}>
                                                <ListItem sx={{ py: 1.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        {test.pass ? (
                                                            <Check color="success" fontSize="small" />
                                                        ) : (
                                                            <Close color="error" fontSize="small" />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                                    {test.name}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Typography
                                                                variant="body2"
                                                                color={test.pass ? 'text.secondary' : 'error.main'}
                                                                sx={{ mt: 0.5 }}
                                                            >
                                                                {test.error ? `❌ ${test.error}` : '✅ Passed successfully'}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < testResults.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </>
                            );
                        })()}
                    </Box>
                )}


            </CardContent>
        </Card>
    );
};

export default ResponseViewer;