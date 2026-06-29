import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Button,
    Typography,
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
    Paper,
    Chip,
    InputAdornment,
} from "@mui/material";
import { Download, Share, PlayArrow, Stop, Search } from "@mui/icons-material";
import TestResultRow from "./TestResultRow";
import TestResultDetail from "./TestResultDetail";
import ReportChart from "./ReportChart";
import { mapApiRequestToState } from "../../../ContextApi/helper/mapApiRequestToState";
import { prepareSingleRequestPayload } from "../../../ContextApi/helper/preparedRequestPayload";
import { Proxy } from "../../../Controller/proxy";
import { useApp } from "../../../ContextApi/AppContext";
import {
    buildPmSandbox,
    runPostRequestScript,
    runPreRequestScript,
} from "../../../ContextApi/helper/runScripts";
import { envController } from "../../../Controller/Environment";
import { deepClone } from "../../../utils/deepClone";

const COLORS = { passed: "#4caf50", failed: "#f44336", noTests: "#ff9800" };

const CompactStat = ({ label, value, subValue, valueColor = "text.primary" }) => (
    <Box textAlign="center" >
        <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
            {label}
        </Typography>
        <Box display="flex" alignItems="baseline" justifyContent="center" gap={0.5}>
            <Typography variant="h5" fontWeight={700} color={valueColor}>
                {value}
            </Typography>
            {subValue && (
                <Typography variant="body2" color="text.secondary">
                    {subValue}
                </Typography>
            )}
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
    const [selectedTestResult, setSelectedTestResult] = useState(null); // New state for detail view
    const abortControllerRef = useRef(null);

    const {
        activeTabData,
        setRunnerTestResults,
        addRunnerTestResult,
        selectedEnvId,
        updateEnvironmentIfChanged,
        setRunnerDelay,
        environments,
        selectedWorkspace,
        setEnvironments,
    } = useApp();

    const testResults = activeTabData?.testResults || [];
    const iterations = activeTabData?.iterations || 1;
    const delay = activeTabData?.delay || 0;
    const fileData = activeTabData?.fileData || [];

    // ... (All your existing logic from useMemo to runTests remains unchanged) ...
    // 🧩 Build Execution Plan
    const allRequestStates = useMemo(
        () =>
            (activeTabData?.data || [])
                .filter((req) => req.checked !== false)
                .map((req) => mapApiRequestToState(req.request)),
        [activeTabData?.data]
    );

    const executionPlan = useMemo(() => {
        if (!allRequestStates.length) return [];
        const plan = [];
        const csvFile = fileData?.[0];
        const hasCsv = csvFile?.data?.length > 0;

        for (let iter = 1; iter <= iterations; iter++) {
            const rowData = hasCsv ? csvFile.data[iter - 1] : null;
            const headers = hasCsv ? csvFile.headers : null;
            if (hasCsv && iter > csvFile.data.length) break;

            allRequestStates.forEach((req) => {
                const payload = prepareSingleRequestPayload(req, rowData, headers);
                plan.push({
                    baseRequest: req,
                    payload,
                    iteration: iter,
                    name: hasCsv ? `${req.name} (Row ${iter})` : req.name,
                });
            });
        }
        return plan;
    }, [allRequestStates, iterations, fileData]);

    // 📊 Stats Calculation
    const stats = useMemo(() => {
        const total = testResults.length;
        const passed = testResults.filter(
            (t) => t.testResult?.length > 0 && t.testResult.every((r) => r.pass)
        ).length;
        const failed = testResults.filter((t) =>
            t.testResult?.some((r) => !r.pass)
        ).length;
        const noTests = total - (passed + failed);
        const totalTime = testResults.reduce(
            (acc, t) => acc + (t.time || t.timingInfo?.durationMs || 0),
            0
        );

        return {
            total,
            passed,
            failed,
            noTests,
            duration: (totalTime / 1000).toFixed(2),
            avgRequestTime: total ? Math.round(totalTime / total) : 0,
        };
    }, [testResults]);

    const passRate =
        stats.total > 0 ? Math.round((stats.passed / (stats.passed + stats.failed)) * 100) : 0;
    // if (isNaN(passRate)) passRate = 0; // Handle case where passed+failed is 0

    // 🚦 Stop Execution
    const stopTests = useCallback(() => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setIsRunning(false);
        setRunningTestName("Test run stopped by user.");
    }, []);

    // 🧠 Helper: Execute a Single Test
    const executeTest = useCallback(
        async (testItem, signal) => {
            const { baseRequest, payload, iteration, name } = testItem;
            const runId = `${baseRequest.id}-${iteration}-${Date.now()}`;
            const startTime = performance.now();

            try {
                const selectedEnv = environments.find((env) => env.id === selectedEnvId);

                 const clonedEnvironments = deepClone(environments);
                const pm = buildPmSandbox({
                    environments: clonedEnvironments,
                    activeEnvName: selectedEnv.name,
                    globalStore: {},
                    response: null,
                    sendSubRequest: async (req, cb) => cb({ status: 200, body: "success" }),
                });

                await runPreRequestScript(payload, pm);
                await updateEnvironmentIfChanged(
                    environments,
                    pm._getAllEnvironments(),
                    selectedWorkspace,
                    setEnvironments,
                    envController
                );

                const proxyResult = await Proxy(payload, activeTabData.id, selectedEnvId);
                if (signal.aborted) throw new Error("Aborted");

                await runPostRequestScript(
                    payload,
                    pm,
                    proxyResult,
                    proxyResult.timingInfo.durationMs
                );
                await updateEnvironmentIfChanged(
                    environments,
                    pm._getAllEnvironments(),
                    selectedWorkspace,
                    setEnvironments,
                    envController
                );

                proxyResult.testResult = pm._getTestResults();
                proxyResult.runId = runId;
                proxyResult.name = name; // Ensure name is attached to the result
                proxyResult.time =
                    proxyResult.timingInfo?.durationMs ||
                    Math.round(performance.now() - startTime);
                return proxyResult;
            } catch (err) {
                return {
                    ...baseRequest,
                    runId,
                    name,
                    status: "Failed",
                    time: Math.round(performance.now() - startTime),
                    error: err.message,
                    request: { payload },
                    response: { error: "Execution failed" },
                };
            }
        },
        [
            activeTabData.id,
            selectedEnvId,
            environments,
            selectedWorkspace,
            setEnvironments,
            updateEnvironmentIfChanged,
        ]
    );

    // 🚀 Main Test Runner
    const runTests = useCallback(async () => {
        if (isRunning || !executionPlan.length) return;

        const controller = new AbortController();
        abortControllerRef.current = controller;
        const { signal } = controller;

        setIsRunning(true);
        setRunnerTestResults(activeTabData.id, []);
        setSelectedTestResult(null); // Deselect on new run
        setRunningTestName("Starting tests...");
        setExpandedTestId(null);
        setProgress(0);

        try {
            for (let i = 0; i < executionPlan.length; i++) {
                if (signal.aborted) break;
                const testItem = executionPlan[i];
                setCurrentTestIndex(i + 1);
                setRunningTestName(`[${i + 1}/${executionPlan.length}] ${testItem.name}`);

                const result = await executeTest(testItem, signal);
                addRunnerTestResult(activeTabData.id, result);

                setProgress(((i + 1) / executionPlan.length) * 100);
                if (delay && i < executionPlan.length - 1)
                    await new Promise((r) => setTimeout(r, delay));
            }
        } finally {
            setIsRunning(false);
            if (!signal.aborted) setRunningTestName("All tests completed!");
        }
    }, [
        isRunning,
        executionPlan,
        delay,
        executeTest,
        activeTabData.id,
        setRunnerTestResults,
        addRunnerTestResult,
    ]);

    
    useEffect(() => {
        setExpandedTestId(null);

        if (testResults.length > 0 && executionPlan.length > 0) {
            const isFinished = testResults.length >= executionPlan.length;
            if (isFinished) {
                setRunningTestName("All tests completed!");
                setProgress(100);
                setCurrentTestIndex(executionPlan.length);
            }
        } else {
            setRunningTestName("");
            setProgress(0);
            setCurrentTestIndex(0);
            runTests();
        }

        return () => {
            // stopTests();
        };
    }, [activeTabData.id, stopTests, executionPlan.length]);



    // 📤 Export CSV
    const handleExport = useCallback(() => {
        if (!testResults.length) return;

        const headers =
            "Run ID,Name,Method,URL,Status,Passed Tests,Failed Tests,Time (ms)\n";

        const csvRows = testResults.map((t) => {
            const passed = t.testResult?.filter((r) => r.pass).length || 0;
            const failed = t.testResult?.filter((r) => !r.pass).length || 0;
            const status = failed ? "Failed" : passed ? "Passed" : "No Tests";

            return [
                t.runId,
                `"${t.name}"`,
                t.requestInfo?.method || "",
                t.requestInfo?.url || "",
                status,
                passed,
                failed,
                t.time || 0,
            ].join(",");
        });

        const blob = new Blob([headers + csvRows.join("\n")], {
            type: "text/csv;charset=utf-8;",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `test-results-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    }, [testResults]);

    // 📎 Share Summary
    const handleShare = useCallback(async () => {
        if (!testResults.length) return;

        const summary = `API Test Summary:
          Total: ${stats.total}
          Passed: ${stats.passed}
          Failed: ${stats.failed}
          Pass Rate: ${passRate}%
          Duration: ${stats.duration}s
         Avg Time: ${stats.avgRequestTime}ms`;

        if (navigator.share)
            await navigator.share({ title: "API Test Results", text: summary });
        else {
            await navigator.clipboard.writeText(summary);
            alert("Copied summary to clipboard!");
        }
    }, [testResults, stats, passRate]);
    // 🎯 Filtered Test Results
    const filteredTests = useMemo(() => {
        let filtered = [...testResults];
        if (tab === 1)
            filtered = filtered.filter(
                (t) => t.testResult?.length && t.testResult.every((r) => r.pass)
            );
        else if (tab === 2)
            filtered = filtered.filter((t) => t.testResult?.some((r) => !r.pass));

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.name?.toLowerCase().includes(q) ||
                    t.requestInfo?.url?.toLowerCase().includes(q) ||
                    t.testResult?.some((r) => r.name?.toLowerCase().includes(q))
            );
        }
        return filtered;
    }, [testResults, tab, searchQuery]);

    const handleClearResults = () => {
        setRunnerTestResults(activeTabData.id, []);
        setSelectedTestResult(null);
        setRunningTestName("");
        setProgress(0);
        setCurrentTestIndex(0);
    }

    // 🎨 Chart Data
    const chartData = useMemo(
        () => [
            { name: "Passed", value: stats.passed, color: COLORS.passed },
            { name: "Failed", value: stats.failed, color: COLORS.failed },
            { name: "No Tests", value: stats.noTests, color: COLORS.noTests },
        ],
        [stats]
    );

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%", // full page height
                gap: 2,
                
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            {/* Header & Controls */}
            <Card variant="outlined" sx={{ flexShrink: 0 }}>
                <CardContent sx={{ p: "16px !important" }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        {/* Left: Run Tests */}
                        <Box display="flex" alignItems="center" gap={2} flex={1}>
                            <Button
                                variant="contained"
                                color={isRunning ? "error" : "primary"}
                                startIcon={isRunning ? <Stop /> : <PlayArrow />}
                                onClick={isRunning ? stopTests : runTests}
                                disabled={!executionPlan.length}
                            >
                                {isRunning ? "Stop" : "Run Tests"}
                            </Button>

                            <Box flexGrow={1}>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {runningTestName}
                                </Typography>
                                {/* <LinearProgress
                                    variant={isRunning ? "determinate" : "indeterminate"}
                                    value={progress}
                                /> */}
                            </Box>
                        </Box>

                        {/* Right: Controls */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <Button
                                onClick={handleClearResults}
                                disabled={isRunning || testResults.length === 0}
                            >
                                Clear Results
                            </Button>

                            <MuiTooltip title="Export results as CSV">
                                <span>

                                    <IconButton onClick={handleExport} disabled={!testResults.length}>
                                        <Download />
                                    </IconButton>
                                </span>
                            </MuiTooltip>

                            <MuiTooltip title="Share summary">
                                <span>
                                    <IconButton onClick={handleShare} disabled={!testResults.length}>
                                        <Share />
                                    </IconButton>
                                </span>
                            </MuiTooltip>
                        </Box>
                    </Box>
                </CardContent>

                {/* Stats Summary */}
                {testResults.length > 0 && (
                    <>
                        <Divider />
                        <CardContent>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                    flexWrap: "wrap",
                                    gap: 2,
                                }}
                            >
                                <CompactStat
                                    label="Pass Rate"
                                    value={`${passRate}%`}
                                    valueColor={
                                        passRate > 80
                                            ? COLORS.passed
                                            : passRate > 50
                                                ? COLORS.noTests
                                                : COLORS.failed
                                    }
                                />
                                <CompactStat
                                    label="Passed"
                                    value={stats.passed}
                                    valueColor={COLORS.passed}
                                />
                                <CompactStat
                                    label="Failed"
                                    value={stats.failed}
                                    valueColor={
                                        stats.failed > 0 ? COLORS.failed : "text.primary"
                                    }
                                />
                                <CompactStat label="Total Requests" value={stats.total} />
                                <CompactStat
                                    label="Avg. Time"
                                    value={stats.avgRequestTime}
                                    subValue="ms"
                                />
                                <CompactStat
                                    label="Total Duration"
                                    value={stats.duration}
                                    subValue="s"
                                />
                            </Box>
                        </CardContent>
                    </>
                )}
            </Card>

            {/* Bottom Split View */}
            <Box
                sx={{
                    display: "flex",
                    flexGrow: 1,
                    minHeight: 0,
                    overflow: "hidden",
                    gap: 2,
                }}
            >
                {/* Left Pane - Test List */}
                <Paper
                    variant="outlined"
                    sx={{
                        flex: "1 1 50%",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {/* Tabs + Search */}
                    <Box sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
                        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
                            <Tab label={`All (${stats.total})`} />
                            <Tab
                                label={`Passed (${stats.passed})`}
                                sx={{ color: COLORS.passed }}
                            />
                            <Tab
                                label={`Failed (${stats.failed})`}
                                sx={{ color: COLORS.failed }}
                            />
                        </Tabs>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ mt: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Test List */}
                    <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
                        {filteredTests.length > 0 ? (
                            filteredTests.map((result) => (
                                <TestResultRow
                                    key={result.runId}
                                    test={result}
                                    isSelected={selectedTestResult?.runId === result.runId}
                                    onClick={() => setSelectedTestResult(result)}
                                />
                            ))
                        ) : (
                            <Box sx={{ p: 4, textAlign: "center" }}>
                                <Typography color="text.secondary">
                                    {testResults.length === 0
                                        ? "Run tests to see results."
                                        : "No results match your filter."}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* Right Pane - Test Details */}
                <Paper
                    variant="outlined"
                    sx={{
                        flex: "1 1 50%",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {selectedTestResult ? (
                        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                            <TestResultDetail result={selectedTestResult} />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography variant="h6" color="text.secondary">
                                {isRunning ? "Running tests..." : "Select a request to see details"}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>

    );
}
export default QATestRunner;