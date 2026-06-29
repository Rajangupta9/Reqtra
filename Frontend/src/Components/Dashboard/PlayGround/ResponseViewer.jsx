import React, { useState } from 'react';
import {
    Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Divider, List, ListItem, ListItemIcon, ListItemText, CircularProgress,
    IconButton, Tooltip, alpha, useTheme,
} from '@mui/material';
import {
    ContentCopy, DownloadOutlined, CheckCircleOutline, WarningOutlined,
    Error, Check, Close, SendOutlined, WifiOff,
} from '@mui/icons-material';
import { useApp } from '../../../ContextApi/AppContext';
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useColorMode } from '../../../Theme/ThemeContext';
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

const STATUS_COLORS = {
    success: { label: '#3FB950', bg: 'rgba(63,185,80,0.1)', border: 'rgba(63,185,80,0.2)' },
    warning: { label: '#D29922', bg: 'rgba(210,153,34,0.1)', border: 'rgba(210,153,34,0.2)' },
    error:   { label: '#F85149', bg: 'rgba(248,81,73,0.1)',  border: 'rgba(248,81,73,0.2)'  },
    info:    { label: '#58A6FF', bg: 'rgba(88,166,255,0.1)', border: 'rgba(88,166,255,0.2)' },
};

const getStatusMeta = (code) => {
    if (!code) return STATUS_COLORS.info;
    if (code < 300) return STATUS_COLORS.success;
    if (code < 400) return STATUS_COLORS.warning;
    return STATUS_COLORS.error;
};

const StatusBadge = ({ code, text }) => {
    const meta = getStatusMeta(code);
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: '5px',
                backgroundColor: meta.bg,
                border: `1px solid ${meta.border}`,
                fontFamily: '"SF Mono","Fira Code","Roboto Mono",monospace',
                fontSize: '12px',
                fontWeight: 700,
                color: meta.label,
                lineHeight: 1.5,
            }}
        >
            {code} {text && <span style={{ fontWeight: 500, opacity: 0.8 }}>{text}</span>}
        </Box>
    );
};

const MetaChip = ({ label }) => (
    <Box
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1,
            py: 0.25,
            borderRadius: '5px',
            backgroundColor: 'action.hover',
            fontSize: '11px',
            fontWeight: 500,
            color: 'text.secondary',
            fontFamily: '"SF Mono","Fira Code","Roboto Mono",monospace',
            border: '1px solid',
            borderColor: 'divider',
            lineHeight: 1.5,
        }}
    >
        {label}
    </Box>
);

const formatTime = (ms) => ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
};
const formatJSON = (data) => {
    try {
        if (typeof data === 'string') return JSON.stringify(JSON.parse(data), null, 2);
        return JSON.stringify(data, null, 2);
    } catch { return String(data); }
};

const EDITOR_MAX_HEIGHT = '60vh';

const ResponseViewer = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { activeTabData } = useApp();
    const { response, responseTime, responseSize, loading, error } = activeTabData;
    const [activeTab, setActiveTab] = useState(0);
    const { mode } = useColorMode();

    /* ── Loading ── */
    if (loading) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    p: 4,
                }}
            >
                <CircularProgress size={32} thickness={3} />
                <Typography variant="body2" color="text.secondary">
                    Waiting for response…
                </Typography>
            </Box>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2.5,
                    p: 4,
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    }}
                >
                    <WifiOff sx={{ fontSize: 22, color: 'error.main' }} />
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Request failed
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 280 }}>
                        {error.message || "Something went wrong while processing your request."}
                    </Typography>
                </Box>
            </Box>
        );
    }

    /* ── Empty ── */
    if (!response) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    p: 4,
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'action.hover',
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <SendOutlined sx={{ fontSize: 20, color: 'text.disabled', transform: 'rotate(-30deg)' }} />
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        Send a request to see the response
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                        Ctrl+Enter to send quickly
                    </Typography>
                </Box>
            </Box>
        );
    }

    const handleTabChange = (_, newValue) => setActiveTab(newValue);

    const copyResponse = () => {
        const body = response.responseInfo?.body || response.data || response;
        const text = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
        navigator.clipboard.writeText(text);
    };

    const downloadResponse = () => {
        const body = response.responseInfo?.body || response.data || response;
        const text = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([text], { type: 'application/json' })),
            download: 'response.json',
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const rawTime = response.timingInfo?.durationMs || responseTime;
    const rawSize = response.responseInfo?.bodySize || responseSize;
    const statusCode = response.responseInfo?.statusCode || response.status;
    const statusText = response.responseInfo?.status || response.statusText || '';
    const headers = response.responseInfo?.headers || response.headers || {};
    const responseBody = response.responseInfo?.body || response.data || response;
    const testResults = Array.isArray(response?.testResult) ? response.testResult : [];
    const passedTests = testResults.filter(t => t.pass).length;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    pt: 1.5,
                    pb: 0,
                    flexShrink: 0,
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                {/* Status row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {statusCode && <StatusBadge code={statusCode} text={statusText} />}
                    {rawTime != null && <MetaChip label={formatTime(rawTime)} />}
                    {rawSize != null && <MetaChip label={formatSize(rawSize)} />}
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Copy response" arrow>
                        <IconButton size="small" onClick={copyResponse} sx={{ borderRadius: '6px' }}>
                            <ContentCopy sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download response" arrow>
                        <IconButton size="small" onClick={downloadResponse} sx={{ borderRadius: '6px' }}>
                            <DownloadOutlined sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Tab bar */}
            <Box sx={{ px: 2, flexShrink: 0 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        minHeight: 38,
                        '& .MuiTab-root': { minHeight: 38, px: 1.5, py: 0 },
                    }}
                >
                    <Tab label="Body" disableRipple />
                    <Tab label="Headers" disableRipple />
                    <Tab label="Cookies" disableRipple />
                    <Tab
                        disableRipple
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                Tests
                                {testResults.length > 0 && (
                                    <Box
                                        sx={{
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            px: 0.75,
                                            py: 0.1,
                                            borderRadius: '4px',
                                            bgcolor: passedTests === testResults.length
                                                ? alpha(theme.palette.success.main, 0.15)
                                                : alpha(theme.palette.error.main, 0.15),
                                            color: passedTests === testResults.length
                                                ? 'success.main'
                                                : 'error.main',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {passedTests}/{testResults.length}
                                    </Box>
                                )}
                            </Box>
                        }
                    />
                </Tabs>
                <Divider />
            </Box>

            {/* Tab content */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, pt: 1.5 }}>

                {/* Body */}
                {activeTab === 0 && (
                    <Paper
                        elevation={0}
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '6px',
                            overflow: 'hidden',
                        }}
                    >
                        <CodeMirror
                            value={responseBody ? formatJSON(responseBody) : "// No response body"}
                            extensions={[json(), EditorView.lineWrapping, EditorState.readOnly.of(true)]}
                            theme={mode === "dark" ? vscodeDark : vscodeLight}
                            style={{ width: "100%", maxHeight: EDITOR_MAX_HEIGHT, overflow: 'auto' }}
                            basicSetup={{
                                foldGutter: true,
                                dropCursor: false,
                                allowMultipleSelections: false,
                                indentOnInput: true,
                            }}
                        />
                    </Paper>
                )}

                {/* Headers */}
                {activeTab === 1 && (
                    <Box>
                        {headers && Object.keys(headers).length > 0 ? (
                            <TableContainer
                                component={Paper}
                                elevation={0}
                                sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '6px' }}
                            >
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(headers).map(([key, value]) => (
                                            <TableRow key={key}>
                                                <TableCell
                                                    sx={{
                                                        fontFamily: '"SF Mono","Fira Code","Roboto Mono",monospace',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap',
                                                        color: 'primary.main',
                                                    }}
                                                >
                                                    {key}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        fontFamily: '"SF Mono","Fira Code","Roboto Mono",monospace',
                                                        fontSize: '12px',
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

                {/* Cookies */}
                {activeTab === 2 && (
                    <Alert severity="info">
                        Cookie information is not available in this environment.
                    </Alert>
                )}

                {/* Tests */}
                {activeTab === 3 && (
                    <Box>
                        {testResults.length === 0 ? (
                            <Alert severity="info">No test scripts found for this request.</Alert>
                        ) : (
                            <>
                                {/* Summary bar */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mb: 2,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {passedTests}/{testResults.length} tests passed
                                    </Typography>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            height: 4,
                                            bgcolor: 'action.disabledBackground',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(passedTests / testResults.length) * 100}%`,
                                                height: '100%',
                                                bgcolor: passedTests === testResults.length
                                                    ? 'success.main'
                                                    : passedTests > 0 ? 'warning.main' : 'error.main',
                                                borderRadius: '4px',
                                                transition: 'width 0.3s ease',
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <List disablePadding>
                                        {testResults.map((test, index) => (
                                            <React.Fragment key={index}>
                                                <ListItem sx={{ py: 1.25, px: 2 }}>
                                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                                        {test.pass
                                                            ? <Check sx={{ fontSize: 15, color: 'success.main' }} />
                                                            : <Close sx={{ fontSize: 15, color: 'error.main' }} />
                                                        }
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                                                                {test.name}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            !test.pass && test.error ? (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: 'error.main',
                                                                        fontFamily: '"SF Mono","Roboto Mono",monospace',
                                                                        fontSize: '11px',
                                                                    }}
                                                                >
                                                                    {test.error}
                                                                </Typography>
                                                            ) : null
                                                        }
                                                    />
                                                </ListItem>
                                                {index < testResults.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ResponseViewer;
