import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
    Paper
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { getMethodColor } from '../../Common/getMethodColour';

const JsonViewer = ({ data }) => {
    try {
        const json = JSON.parse(data);
        return (
            <pre
                style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    margin: 0,
                    fontSize: '0.85rem',
                    width: '100%',
                }}
            >
                {JSON.stringify(json, null, 2)}
            </pre>
        );
    } catch {
        return (
            <pre
                style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    margin: 0,
                    fontSize: '0.85rem',
                    width: '100%',
                }}
            >
                {data}
            </pre>
        );
    }
};

const HeaderTable = ({ headers }) => (
    <Table size="small" sx={{ width: '100%' }}>
        <TableHead>
            <TableRow>
                <TableCell sx={{ width: '30%' }}>Key</TableCell>
                <TableCell>Value</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {Object.entries(headers || {}).map(([key, value]) => (
                <TableRow key={key}>
                    <TableCell sx={{ width: '30%' }}>{key}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{value}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const TestResultDetail = ({ result }) => {
    const [tab, setTab] = useState(0);

    if (!result) return null;

    const passedCount = result.testResult?.filter((t) => t.pass).length || 0;
    const failedCount = (result.testResult?.length || 0) - passedCount;

    const renderMethodBadge = (method) => (
        <Typography
            variant="caption"
            sx={{
                display: 'inline-block',
                fontWeight: 'bold',
                fontSize: '10px',
                px: '6px',
                py: '2px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
                // bgcolor: `${getMethodColor(method)}20`,
                color: getMethodColor(method),
            }}
        >
            {method?.toUpperCase()}
        </Typography>
    );


    return (
        <Box
            sx={{
                p: 2,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Request Info Header */}
            <Box mb={2} width="100%">
                <Typography
                    variant="body1"
                    noWrap
                    sx={{
                        wordBreak: "break-all",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {renderMethodBadge(result?.requestInfo?.method)}
                    <Box
                        component="span"
                        sx={{
                            flexShrink: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {result?.requestInfo?.url || "—"}
                    </Box>
                </Typography>
            </Box>

            {/* Meta Info */}
            <Box
                display="flex"
                gap={4}
                mb={2}
                flexWrap="wrap"
                width="100%"
            >
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Status
                    </Typography>
                    <Typography
                        color={
                            result.responseInfo?.statusCode >= 400
                                ? 'error.main'
                                : 'success.main'
                        }
                    >
                        {result.responseInfo?.status || 'Network Error'}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Time
                    </Typography>
                    <Typography>{result.time} ms</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Size
                    </Typography>
                    <Typography>
                        {((result.responseInfo?.bodySize || 0) / 1024).toFixed(2)} KB
                    </Typography>
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    minHeight: '40px',
                    width: '100%',
                }}
            >
                <Tab label={`Test Results (${passedCount}/${passedCount + failedCount})`} />
                <Tab label="Response Body" />
                <Tab label="Response Headers" />
                <Tab label="Request Headers" />
            </Tabs>

            {/* Tab Content */}
            <Box
                mt={2}
                flexGrow={1}
                overflow="auto"
                sx={{ width: '100%', maxHeight: 'calc(100% - 160px)' }}
            >
                {tab === 0 && (
                    <Box width="100%">
                        {result.testResult?.length > 0 ? (
                            result.testResult.map((t) => (
                                <Box
                                    key={t.name}
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    mb={0.5}
                                >
                                    {t.pass ? (
                                        <CheckCircle fontSize="small" color="success" />
                                    ) : (
                                        <Cancel fontSize="small" color="error" />
                                    )}
                                    <Typography variant="body2">{t.name}</Typography>
                                    {t.error && (
                                        <Typography variant="body2" color="error.main">
                                            {t.error}
                                        </Typography>
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography color="text.secondary">
                                No tests were run for this request.
                            </Typography>
                        )}
                    </Box>
                )}

                {tab === 1 && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 1.5,
                            backgroundColor: 'action.hover',
                            maxHeight: 400,
                            overflow: 'auto',
                            width: '100%',
                        }}
                    >
                        <JsonViewer data={result.responseInfo?.body} />
                    </Paper>
                )}

                {tab === 2 && <HeaderTable headers={result.responseInfo?.headers} />}

                {tab === 3 && <HeaderTable headers={result.requestInfo?.headers} />}
            </Box>
        </Box>
    );
};

export default TestResultDetail;
