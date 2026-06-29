import React, { useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Button,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  InputBase,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { Add, DeleteOutline } from "@mui/icons-material";
import FakerTextField from "./helper/FakerTextField";

const KeyValueTable = ({
  data,
  onChange,
  onAdd,
  onRemove,
  title,
  hasTypeColumn = false,
  hasDescriptionColumn = true,
  placeholder = { key: "Key", value: "Value", description: "Description" },
  typeOptions = [
    { value: "text", label: "Text" },
    { value: "file", label: "File" },
  ],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(data) && data.length === 0) {
      onAdd();
    }
  }, [data, onAdd]);

  const updateRow = (index, updates) => {
    const isLastRow = index === data.length - 1;
    const isNewKeyEntry = "key" in updates && (data[index]?.key === "" || updates.key !== "");
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
    if (isLastRow && isNewKeyEntry) onAdd();
  };

  const handleRemove = (index) => {
    if (data.length > 1) onRemove(index);
  };

  const handleChooseFileClick = () => fileInputRef.current?.click();

  function uint8ToBase64(uint8Array) {
    let binary = "";
    for (let i = 0; i < uint8Array.byteLength; i++) binary += String.fromCharCode(uint8Array[i]);
    return btoa(binary);
  }

  const inputBaseSx = {
    fontSize: '12px',
    width: '100%',
    px: 1,
    py: 0.5,
    borderRadius: '4px',
    color: 'text.primary',
    transition: 'background-color 0.1s ease',
    '&:hover': {
      backgroundColor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
    },
    '&.Mui-focused': {
      backgroundColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
      boxShadow: `inset 0 0 0 1.5px ${alpha(theme.palette.primary.main, 0.45)}`,
      borderRadius: '4px',
    },
    '& input::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1,
    },
  };

  return (
    <Box>
      {title && (
        <Typography
          variant="overline"
          sx={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.08em', color: 'text.secondary', mb: 1.5, display: 'block' }}
        >
          {title}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="36px" padding="checkbox" sx={{ pl: 1 }} />
              <TableCell sx={{ minWidth: 140 }}>{placeholder.key}</TableCell>
              <TableCell sx={{ minWidth: 140 }}>{placeholder.value}</TableCell>
              {hasTypeColumn && <TableCell sx={{ width: 90 }}>Type</TableCell>}
              {hasDescriptionColumn && <TableCell>{placeholder.description}</TableCell>}
              <TableCell width="40px" />
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                  opacity: item.enabled === false ? 0.45 : 1,
                  transition: 'opacity 0.15s ease, background-color 0.1s ease',
                }}
              >
                {/* Enabled */}
                <TableCell padding="checkbox" sx={{ pl: 1 }}>
                  <Checkbox
                    checked={item.enabled ?? true}
                    onChange={(e) => updateRow(index, { enabled: e.target.checked })}
                    size="small"
                    sx={{ p: '3px' }}
                  />
                </TableCell>

                {/* Key */}
                <TableCell sx={{ py: 0.5 }}>
                  <FakerTextField
                    item={{ ...item, value: item.key }}
                    index={index}
                    updateRow={(i, updated) => updateRow(i, { key: updated.value })}
                    placeholder={placeholder.key}
                    small
                  />
                </TableCell>

                {/* Value */}
                <TableCell sx={{ py: 0.5 }}>
                  {hasTypeColumn && item.type === "file" ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0] || null;
                          if (!file) return;
                          const binaryData = new Uint8Array(await file.arrayBuffer());
                          updateRow(index, { value: uint8ToBase64(binaryData), filename: file.name });
                          e.target.value = "";
                        }}
                      />
                      {item.filename ? (
                        <Tooltip title={item.filename}>
                          <Chip
                            label={item.filename}
                            onDelete={() => updateRow(index, { value: null, filename: null })}
                            size="small"
                            variant="outlined"
                            sx={{ maxWidth: 150, fontSize: '11px' }}
                          />
                        </Tooltip>
                      ) : (
                        <Button variant="outlined" size="small" onClick={handleChooseFileClick}
                          sx={{ fontSize: '11px', height: 26, px: 1.25 }}>
                          Choose File
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <FakerTextField
                      item={item}
                      index={index}
                      updateRow={updateRow}
                      placeholder={placeholder.value}
                    />
                  )}
                </TableCell>

                {/* Type */}
                {hasTypeColumn && (
                  <TableCell sx={{ py: 0.5 }}>
                    <Select
                      value={item.type || "text"}
                      onChange={(e) => updateRow(index, { type: e.target.value, value: "" })}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '11px',
                        height: 26,
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                      }}
                    >
                      {typeOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '11px', py: 0.5 }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                )}

                {/* Description */}
                {hasDescriptionColumn && (
                  <TableCell sx={{ py: 0.5 }}>
                    <InputBase
                      value={item.description || ""}
                      onChange={(e) => updateRow(index, { description: e.target.value })}
                      placeholder={placeholder.description}
                      fullWidth
                      sx={inputBaseSx}
                    />
                  </TableCell>
                )}

                {/* Delete */}
                <TableCell sx={{ py: 0.5, pr: 1 }}>
                  <Tooltip title="Remove row" arrow>
                    <span>
                      <IconButton
                        onClick={() => handleRemove(index)}
                        size="small"
                        disabled={data.length <= 1}
                        sx={{
                          p: '3px',
                          opacity: 0.4,
                          '&:hover': {
                            opacity: 1,
                            color: 'error.main',
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                          },
                          '&.Mui-disabled': { opacity: 0.15 },
                        }}
                      >
                        <DeleteOutline sx={{ fontSize: 15 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer */}
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            px: 1,
            py: 0.5,
            bgcolor: isDark ? alpha('#000', 0.15) : alpha('#000', 0.01),
          }}
        >
          <Button
            startIcon={<Add sx={{ fontSize: '14px !important' }} />}
            onClick={onAdd}
            size="small"
            sx={{
              fontSize: '12px',
              color: 'text.secondary',
              fontWeight: 500,
              '&:hover': { color: 'primary.main' },
            }}
          >
            Add row
          </Button>
        </Box>
      </TableContainer>
    </Box>
  );
};

export default KeyValueTable;
