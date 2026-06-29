import React from 'react';
import {
    Box,
    Typography,
    Switch,
    TextField,
    Grid,
    Divider,
    useTheme,
} from '@mui/material';
import { useApp } from '../../../ContextApi/AppContext';
import { ActionTypes } from '../../../ContextApi/helper/actionTypes';

const SectionLabel = ({ children }) => (
    <Typography
        variant="overline"
        sx={{
            fontSize: '10.5px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'text.secondary',
            mb: 2,
            display: 'block',
        }}
    >
        {children}
    </Typography>
);

const SettingRow = ({ label, description, children }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
        }}
    >
        <Box sx={{ flex: 1, pr: 4 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.4 }}>
                {label}
            </Typography>
            {description && (
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                    {description}
                </Typography>
            )}
        </Box>
        {children}
    </Box>
);

const SettingsTab = () => {
    const theme = useTheme();
    const { activeTabData, activeTabId, dispatch } = useApp();
    const { settings } = activeTabData;

    const updateSetting = (key, value) => {
        dispatch({
            type: ActionTypes.UPDATE_SETTINGS,
            payload: { tabId: activeTabId, data: { [key]: value } }
        });
    };

    return (
        <Box sx={{ maxWidth: 580, py: 1 }}>

            {/* General */}
            <SectionLabel>General</SectionLabel>

            <Box
                sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    mb: 3,
                }}
            >
                <Box sx={{ px: 2 }}>
                    <SettingRow
                        label="Follow redirects"
                        description="Automatically follow HTTP redirects"
                    >
                        <Switch
                            checked={settings.followRedirects}
                            onChange={(e) => updateSetting('followRedirects', e.target.checked)}
                            size="small"
                        />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                        label="Validate SSL certificates"
                        description="Verify SSL certificates for HTTPS requests"
                    >
                        <Switch
                            checked={settings.validateSSL}
                            onChange={(e) => updateSetting('validateSSL', e.target.checked)}
                            size="small"
                        />
                    </SettingRow>
                </Box>
            </Box>

            {/* Timeouts */}
            <SectionLabel>Timeouts &amp; Limits</SectionLabel>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Request timeout"
                        type="number"
                        value={settings.timeout}
                        onChange={(e) => updateSetting('timeout', parseInt(e.target.value) || 30000)}
                        fullWidth
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', ml: 0.5 }}>
                                    ms
                                </Typography>
                            ),
                        }}
                        helperText="Max wait time for a response"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Max redirects"
                        type="number"
                        value={settings.maxRedirects}
                        onChange={(e) => updateSetting('maxRedirects', parseInt(e.target.value) || 5)}
                        fullWidth
                        size="small"
                        inputProps={{ min: 0, max: 20 }}
                        helperText="Maximum number of redirects"
                    />
                </Grid>
            </Grid>

            {/* Advanced */}
            <SectionLabel>Advanced</SectionLabel>

            <Box
                sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ px: 2 }}>
                    <SettingRow
                        label="Send cookies"
                        description="Include cookies in outgoing requests"
                    >
                        <Switch
                            checked={settings.sendCookies || false}
                            onChange={(e) => updateSetting('sendCookies', e.target.checked)}
                            size="small"
                        />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                        label="Send User-Agent header"
                        description="Include User-Agent in request headers"
                    >
                        <Switch
                            checked={settings.sendUserAgent !== false}
                            onChange={(e) => updateSetting('sendUserAgent', e.target.checked)}
                            size="small"
                        />
                    </SettingRow>

                    <Divider />

                    <SettingRow
                        label="Auto-parse responses"
                        description="Try to parse JSON/XML responses automatically"
                    >
                        <Switch
                            checked={settings.automaticallyParseResponse !== false}
                            onChange={(e) => updateSetting('automaticallyParseResponse', e.target.checked)}
                            size="small"
                        />
                    </SettingRow>
                </Box>
            </Box>
        </Box>
    );
};

export default SettingsTab;
