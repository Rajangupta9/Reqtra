import React from "react";
import { Box, Typography, Chip, Paper } from "@mui/material";
import { CheckCircle, Cancel, Help } from "@mui/icons-material";

const COLORS = { passed: "#4caf50", failed: "#f44336", noTests: "#ff9800" };

const getStatus = (test) => {
    if (test.error) return { label: 'Failed', color: COLORS.failed, icon: <Cancel fontSize="small" /> };
    if (!test.testResult || test.testResult.length === 0) return { label: 'No Tests', color: COLORS.noTests, icon: <Help fontSize="small" /> };
    if (test.testResult.some(r => !r.pass)) return { label: 'Failed', color: COLORS.failed, icon: <Cancel fontSize="small" /> };
    return { label: 'Passed', color: COLORS.passed, icon: <CheckCircle fontSize="small" /> };
};

const TestResultRow = ({ test, isSelected, onClick }) => {
    const status = getStatus(test);
    const passedTests = test.testResult?.filter(t => t.pass).length || 0;
    const totalTests = test.testResult?.length || 0;

    return (
        <Paper
            variant="outlined"
            onClick={onClick}
            sx={{
                p: 1.5,
                mb: 1,
                cursor: "pointer",
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderColor: isSelected ? 'primary.main' : 'divider',
                backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                '&:hover': {
                    backgroundColor: 'action.hover'
                }
            }}
        >
            <Box color={status.color}>{status.icon}</Box>

            <Box flexGrow={1} overflow="hidden">
                <Typography noWrap fontWeight={500} variant="body2">{test.name}</Typography>
                <Typography noWrap variant="caption" color="text.secondary">{test.requestInfo?.url}</Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2} flexShrink={0}>
                {totalTests > 0 && <Chip label={`${passedTests} / ${totalTests}`} size="small" variant="outlined" />}
                <Chip label={test.responseInfo?.status || 'Error'} size="small" color={test.responseInfo?.statusCode >= 400 ? 'error' : 'success'} variant="outlined" />
                <Typography variant="body2" color="text.secondary" width="60px" textAlign="right">{test.time} ms</Typography>
            </Box>
        </Paper>
    );
};

export default TestResultRow;