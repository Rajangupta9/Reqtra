import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { useApp } from "../../../ContextApi/AppContext";
import { ActionTypes } from "../../../ContextApi/helper/actionTypes";
// -------------------- Helper Components -------------------- //
const AUTH_TYPES = ["No Auth", "API Key", "Bearer Token", "Basic Auth"];

const SensitiveTextField = memo(({ label, value, onChange, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={show ? "text" : "password"}
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={`toggle ${label} visibility`}
              onClick={() => setShow((s) => !s)}
              edge="end"
              size="small"
            >
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
});

const NoAuth = memo(() => (
  <Box
    sx={{
      mt: 2.5,
      py: 2,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      color: "text.secondary",
    }}
  >
    <LockOutlined sx={{ fontSize: 18, flexShrink: 0 }} />
    <Typography variant="body2" color="text.secondary">
      This request will be sent without any authorization credentials.
    </Typography>
  </Box>
));

const BearerTokenAuth = memo(({ data, onChange }) => (
  <Box sx={{ mt: 2 }}>
    <TextField
      label="Token"
      value={data.bearerToken || ""}
      onChange={(e) => onChange("bearerToken", e.target.value)}
      fullWidth
      multiline
      rows={3}
      size="small"
      placeholder="Enter bearer token"
      sx={{ wordBreak: "break-all" }}
    />
  </Box>
));

const BasicAuth = memo(({ data, onChange }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
    <TextField
      label="Username"
      value={data.basicAuth?.username || ""}
      onChange={(e) => onChange("basicAuth.username", e.target.value)}
      fullWidth
      size="small"
      placeholder="Enter username"
    />
    <SensitiveTextField
      label="Password"
      value={data.basicAuth?.password || ""}
      onChange={(e) => onChange("basicAuth.password", e.target.value)}
      size="small"
      placeholder="Enter password"
    />
  </Box>
));

const ApiKeyAuth = memo(({ data, onChange }) => (
  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
    <Box sx={{ display: "flex", gap: 2 }}>
      <TextField
        label="Key"
        value={data.apiKey?.key || ""}
        onChange={(e) => onChange("apiKey.key", e.target.value)}
        fullWidth
        size="small"
        placeholder="e.g., X-API-Key"
      />
      <SensitiveTextField
        label="Value"
        value={data.apiKey?.value || ""}
        onChange={(e) => onChange("apiKey.value", e.target.value)}
        size="small"
        placeholder="Enter API key"
      />
    </Box>
    <FormControl fullWidth size="small">
      <InputLabel>Add to</InputLabel>
      <Select
        value={data.apiKey?.addTo || "header"}
        onChange={(e) => onChange("apiKey.addTo", e.target.value)}
        label="Add to"
      >
        <MenuItem value="header">Header</MenuItem>
        <MenuItem value="query">Query Params</MenuItem>
      </Select>
    </FormControl>
  </Box>
));


const AuthorizationTab = () => {
  const { activeTabData, activeTabId, dispatch } = useApp();
  const { authType, authData } = activeTabData;

  const [localAuthData, setLocalAuthData] = useState(authData);

  // keep local in sync with global
  useEffect(() => {
    setLocalAuthData(authData);
  }, [authData]);

  // debounce global updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(localAuthData) !== JSON.stringify(authData)) {
        dispatch({ type: ActionTypes.UPDATE_AUTH_DATA, payload: {tabId:activeTabId, data:localAuthData} });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localAuthData, authData, dispatch]);

  const handleAuthTypeChange = useCallback(
    (event) => {
      dispatch({ type: ActionTypes.SET_AUTH_TYPE, payload: {tabId:activeTabId,value:event.target.value }});
    },
    [dispatch]
  );

  const handleDataChange = useCallback((path, value) => {
    setLocalAuthData((prev) => {
      const newState = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  }, []);

  const renderAuthForm = () => {
    const props = { data: localAuthData, onChange: handleDataChange };
    switch (authType) {
      case "Bearer Token":
        return <BearerTokenAuth {...props} />;
      case "Basic Auth":
        return <BasicAuth {...props} />;
      case "API Key":
        return <ApiKeyAuth {...props} />;
      default:
        return <NoAuth />;
    }
  };

  return (
    <Box sx={{ maxWidth: 520 }}>
      <FormControl size="small" sx={{ minWidth: 200, mb: 0.5 }}>
        <InputLabel sx={{ fontSize: '13px' }}>Auth type</InputLabel>
        <Select value={authType} onChange={handleAuthTypeChange} label="Auth type" sx={{ fontSize: '13px' }}>
          {AUTH_TYPES.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {renderAuthForm()}
    </Box>
  );
};

export default memo(AuthorizationTab);
