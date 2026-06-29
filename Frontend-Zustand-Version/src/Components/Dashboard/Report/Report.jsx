import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Button,
    Typography,
    Chip,
    Tabs,
    Tab,
    TextField,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Alert,
    LinearProgress,
    Grid,
    IconButton,
    Tooltip as MuiTooltip,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download, Share, PlayArrow, Stop } from "@mui/icons-material";
import { TestResultRow } from "./TestResultRow";
import { useAppStore } from "../../../Store/useAppStore";
import { mapApiRequestToState } from "../../../ContextApi/helper/mapApiRequestToState";
import { prepareSingleRequestPayload } from "../../../ContextApi/helper/preparedRequestPayload";
import { Proxy } from "../../../Controller/proxy";

const COLORS = {
    passed: "#4caf50",
    failed: "#f44336",
    warning: "#ff9800",
};

// This component is now used to display the core stats.
const CompactStat = ({ label, value, subValue, valueColor = "text.primary" }) => (
    <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            {label}
        </Typography>
        <Box display="flex" alignItems="baseline" gap={0.5}>
            <Typography variant="h5" fontWeight={700} color={valueColor}>
                {value}
            </Typography>
            {subValue && <Typography variant="body2" color="text.secondary">{subValue}</Typography>}
        </Box>
    </Box>
);

const QATestRunner = () => {
    const [tab, setTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [runningTestName, setRunningTestName] = useState("");
    const [expandedTestId, setExpandedTestId] = useState(null);
    const abortControllerRef = useRef(null);

    const getActiveTabData = useAppStore(state => state.activeTabData);
    const setRunnerTestResults = useAppStore(state => state.setRunnerTestResults);
    const addRunnerTestResult = useAppStore(state => state.addRunnerTestResult);
    const selectedEnvId = useAppStore(state => state.selectedEnvId);
    const setRunnerDelay = useAppStore(state => state.setRunnerDelay);

    const activeTabData = getActiveTabData();
    const testResults = activeTabData?.testResults || [];
    const iterations = activeTabData?.iterations || 1;
    const delay = activeTabData?.delay || 0;
    const fileData = activeTabData?.fileData || [];

    const allRequestStates = useMemo(
        () =>
            activeTabData.data
                .filter((req) => req.checked !== false)
                .map((req) => mapApiRequestToState(req.request)),
        [activeTabData]
    );

    const executionPlan = useMemo(() => {
        const plan = [];
        if (!allRequestStates || allRequestStates.length === 0) return [];

        const csvFile = fileData && fileData[0];
        const hasCsvData = csvFile && csvFile.data && csvFile.data.length > 0;

        for (let iter = 1; iter <= iterations; iter++) {
            const rowIndex = iter - 1;
            let csvRowData = null;
            let csvHeaders = null;

            if (hasCsvData && rowIndex < csvFile.data.length) {
                csvRowData = csvFile.data[rowIndex];
                csvHeaders = csvFile.headers;
            } else if (hasCsvData) {
                continue;
            }

            for (const requestState of allRequestStates) {
                const payload = prepareSingleRequestPayload(requestState, csvRowData, csvHeaders);
                const name = hasCsvData
                    ? `${requestState.name} (Row ${rowIndex + 1})`
                    : requestState.name;

                plan.push({
                    baseRequest: requestState,
                    payload: payload,
                    iteration: iter,
                    csvRowIndex: hasCsvData ? rowIndex + 1 : null,
                    name: name
                });
            }
        }
        return plan;
    }, [allRequestStates, iterations, fileData]);

    const stats = useMemo(() => {
        const passed = testResults.filter((t) => t.status === "Passed").length;
        const failed = testResults.filter((t) => t.status === "Failed").length;
        const total = testResults.length;
        const totalTime = testResults.reduce((acc, test) => acc + test.time, 0);
        const avgTime = total > 0 ? Math.round(totalTime / total) : 0;
        return { passed, failed, total, duration: (totalTime / 1000).toFixed(2), avgRequestTime: avgTime };
    }, [testResults]);

    const stopTests = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsRunning(false);
            setRunningTestName("Tests stopped by user");
        }
    }, []);

    const runTests = useCallback(async () => {
        if (isRunning || executionPlan.length === 0) return;

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        setIsRunning(true);
        setRunnerTestResults(activeTabData.id, []);
        setExpandedTestId(null);
        setProgress(0);
        setCurrentTestIndex(0);
        setRunningTestName("Starting test run...");

        try {
            for (let i = 0; i < executionPlan.length; i++) {
                if (signal.aborted) break;

                const currentTest = executionPlan[i];
                const { baseRequest, payload, iteration, name } = currentTest;

                setCurrentTestIndex(i + 1);
                setRunningTestName(`[Iter ${iteration}/${iterations}] ${name}`);

                const startTime = performance.now();
                let result;
                const runId = `${baseRequest.id}-${iteration}-${i}`;

                try {
                    const proxyResult = await Proxy(payload, activeTabData.id, selectedEnvId);
                    const { responseInfo, timingInfo } = proxyResult;

                    result = {
                        ...baseRequest,
                        runId,
                        name,
                        tabId: activeTabData.id,
                        code: responseInfo?.statusCode ?? 0,
                        status: responseInfo?.statusCode >= 200 && responseInfo?.statusCode < 300 ? "Passed" : "Failed",
                        time: timingInfo?.durationMs ?? Math.round(performance.now() - startTime),
                        response: responseInfo?.body ? JSON.parse(responseInfo.body) : {},
                        responseHeaders: responseInfo?.headers ?? {},
                        request: proxyResult.requestInfo,
                    };
                } catch (error) {
                    if (error.name === "AbortError") break;
                    result = {
                        ...baseRequest,
                        runId,
                        name,
                        tabId: activeTabData.id,
                        code: 0,
                        time: Math.round(performance.now() - startTime),
                        status: "Failed",
                        error: error.message,
                    };
                }

                addRunnerTestResult(activeTabData.id, result);
                setProgress(((i + 1) / executionPlan.length) * 100);

                if (i < executionPlan.length - 1 && !signal.aborted) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        } finally {
            if (!signal.aborted) {
                setIsRunning(false);
                setRunningTestName("All tests completed!");
            }
        }
    }, [executionPlan, delay, isRunning, selectedEnvId, iterations]);

    useEffect(() => {
        
        setRunningTestName("");
        setExpandedTestId(null);
        stopTests();
    }, [activeTabData.id, stopTests]);

    const handleExport = useCallback(() => {
        if (testResults.length === 0) return;
        const headers = "ID,Name,Method,Endpoint,Status,Code,Time (ms)\n";
        const csvRows = testResults.map(t =>
            [t.id, `"${t.name}"`, t.method, t.endpoint, t.status, t.code, t.time].join(',')
        );
        const csvString = headers + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `test-results-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [testResults]);

    const handleShare = useCallback(async () => {
        if (testResults.length === 0) return;
        const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
        const summaryText = `API Test Results:\n- Total: ${stats.total}\n- Passed: ${stats.passed} (${passRate}%)\n- Failed: ${stats.failed}\n- Duration: ${stats.duration}s\n- Avg Time: ${stats.avgRequestTime}ms`;

        if (navigator.share) {
            try {
                await navigator.share({ title: "API Test Results", text: summaryText });
            } catch (error) { console.error("Share failed:", error); }
        } else {
            navigator.clipboard.writeText(summaryText);
            alert("Results summary copied to clipboard!");
        }
    }, [testResults, stats]);

    const chartData = useMemo(() => [
        { name: "Passed", value: stats.passed },
        { name: "Failed", value: stats.failed }
    ], [stats]);

    const filteredTests = useMemo(() => {
        let filtered = testResults;
        
        if (tab === 1) filtered = filtered.filter((t) => t.status === "Passed");
        else if (tab === 2) filtered = filtered.filter((t) => t.status === "Failed");

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => t.name?.toLowerCase().includes(query) || t.endpoint?.toLowerCase().includes(query));
        }
        return filtered;
    }, [testResults, tab, searchQuery]);

    const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

    return (
        <Box sx={{ p: 2 ,  height: 'calc(100% )', boxSizing: 'border-box'}}>
            <Card elevation={5} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardHeader
                    title={<Typography variant="h5" fontWeight={700}>QA API Test Runner</Typography>}
                    action={
                        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                            <TextField
                                size="small"
                                type="number"
                                label="Delay (ms)"
                                value={delay ?? ""}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    const value = inputValue === "" ? 0 : Math.max(0, parseInt(inputValue, 10));
                                    setRunnerDelay(activeTabData.id, value);
                                }}
                                sx={{ width: 120 }}
                                disabled={isRunning}
                            />
                            {isRunning ? (
                                <Button variant="contained" color="error" onClick={stopTests} startIcon={<Stop />}>Stop</Button>
                            ) : (
                                <Button variant="contained" onClick={runTests} startIcon={<PlayArrow />}>Run Tests</Button>
                            )}
                            <MuiTooltip title="Export as CSV">
                                <span>
                                    <IconButton onClick={handleExport} disabled={isRunning || testResults.length === 0} color="primary"><Download /></IconButton>
                                </span>
                            </MuiTooltip>
                            <MuiTooltip title="Share Results">
                                <span>
                                    <IconButton onClick={handleShare} disabled={isRunning || testResults.length === 0} color="primary"><Share /></IconButton>
                                </span>
                            </MuiTooltip>
                        </Box>
                    }
                    sx={{ pb: 1 }}
                />
                
                {/* --- ✨ NEW STATISTICS SECTION ✨ --- */}
                {(isRunning || testResults.length > 0) ? (
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ mb: 2 }}>
                            <LinearProgress variant="determinate" value={progress} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">{runningTestName}</Typography>
                                <Typography variant="caption" color="text.secondary">{currentTestIndex} / {executionPlan.length}</Typography>
                            </Box>
                        </Box>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4} sx={{ height: 120 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={35}>
                                            <Cell key="cell-passed" fill={COLORS.passed} />
                                            <Cell key="cell-failed" fill={COLORS.failed} />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}><CompactStat label="Total Tests" value={stats.total} /></Grid>
                                    <Grid item xs={6} sm={3}><CompactStat label="Pass Rate" value={`${passRate}%`} valueColor={passRate > 90 ? COLORS.passed : passRate > 70 ? COLORS.warning : COLORS.failed} /></Grid>
                                    <Grid item xs={6} sm={3}><CompactStat label="Avg. Time" value={stats.avgRequestTime} subValue="ms" /></Grid>
                                    <Grid item xs={6} sm={3}><CompactStat label="Duration" value={stats.duration} subValue="s" /></Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                ) : (
                    <CardContent>
                        <Alert severity="info" icon={<PlayArrow />}>Click "Run Tests" to start the execution.</Alert>
                    </CardContent>
                )}
                {/* --- END STATISTICS SECTION --- */}

                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 2 }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                        <Tab label={`All (${testResults.length})`} />
                        <Tab label={`Passed (${stats.passed})`} />
                        <Tab label={`Failed (${stats.failed})`} />
                    </Tabs>
                    <TextField size="small" placeholder="Search tests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ width: 250 }} />
                </Box>
                <Box sx={{ mb: 1, overflowY: 'auto' }}>
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: 'background.paper' }}>
                        {filteredTests.length === 0 && !isRunning ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    {testResults.length === 0 ? "No tests have been run yet" : "No results match your filter"}
                                </Typography>
                            </Box>
                        ) : (
                            filteredTests.map((test) => (
                                <TestResultRow
                                    key={test.runId}
                                    test={test}
                                    isExpanded={expandedTestId === test.runId}
                                    onToggle={() => setExpandedTestId(expandedTestId === test.runId ? null : test.runId)}
                                />
                            ))
                        )}
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default QATestRunner;