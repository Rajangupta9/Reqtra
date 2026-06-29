import React from 'react';
import {
    Box,
    Typography,
    FormControlLabel,
    Switch,
    TextField,
    Card,
    CardContent,
    Grid,
    Divider
} from '@mui/material';
import { useApp } from '../../../ContextApi/AppContext';
import { ActionTypes } from '../../../ContextApi/helper/actionTypes';

const SettingsTab = () => {
    const { activeTabData, activeTabId, dispatch } = useApp();
    const { settings } = activeTabData;

    const updateSetting = (key, value) => {
        dispatch({
            type: ActionTypes.UPDATE_SETTINGS,
            payload: {tabId:activeTabId, data:{[key]: value} }
        });
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '16px', fontWeight: 600 }}>
                Request Settings
            </Typography>

            <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                    <Grid container spacing={3}>
                        {/* General Settings */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                General
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.followRedirects}
                                            onChange={(e) => updateSetting('followRedirects', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Follow redirects
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Automatically follow HTTP redirects
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.validateSSL}
                                            onChange={(e) => updateSetting('validateSSL', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Validate SSL certificates
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Verify SSL certificates for HTTPS requests
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        {/* Timeout Settings */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Timeouts & Limits
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Request timeout"
                                        type="number"
                                        value={settings.timeout}
                                        onChange={(e) => updateSetting('timeout', parseInt(e.target.value) || 30000)}
                                        fullWidth
                                        InputProps={{
                                            endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>ms</Typography>
                                        }}
                                        helperText="Maximum time to wait for a response"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Max redirects"
                                        type="number"
                                        value={settings.maxRedirects}
                                        onChange={(e) => updateSetting('maxRedirects', parseInt(e.target.value) || 5)}
                                        fullWidth
                                        inputProps={{ min: 0, max: 20 }}
                                        helperText="Maximum number of redirects to follow"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        {/* Additional Settings */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Advanced
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.sendCookies || false}
                                            onChange={(e) => updateSetting('sendCookies', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Send cookies
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Include cookies in requests
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.sendUserAgent || true}
                                            onChange={(e) => updateSetting('sendUserAgent', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Send User-Agent header
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Include User-Agent in request headers
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.automaticallyParseResponse || true}
                                            onChange={(e) => updateSetting('automaticallyParseResponse', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Automatically parse responses
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Try to parse JSON/XML responses automatically
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SettingsTab;