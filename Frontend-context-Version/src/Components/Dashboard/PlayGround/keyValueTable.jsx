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
} from "@mui/material";
import { Add, Delete, DeleteOutline } from "@mui/icons-material";
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
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(data) && data.length === 0) {
      onAdd();
    }
  }, [data, onAdd]);

  const updateRow = (index, updates) => {
    const isLastRow = index === data.length - 1;
    const isNewKeyEntry =
      "key" in updates && (data[index]?.key === "" || updates.key !== "");

    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);

    if (isLastRow && isNewKeyEntry) {
      onAdd();
    }
  };

  const handleRemove = (index) => {
    if (data.length > 1) {
      onRemove(index);
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  function uint8ToBase64(uint8Array) {
    let binary = "";
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  return (
    <Box sx={{ height: "100%" }}>
      {title && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: "16px", fontWeight: 600 }}
        >
          {title}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: 1,
          borderRadius: "6px",
          overflow: "hidden",
          borderColor: "divider",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="40px" padding="checkbox" />
              <TableCell>
                <Typography sx={{ fontWeight: 500, pl: 1, fontSize: 12 }}>
                  {placeholder.key}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 500, pl: 1, fontSize: 12 }}>
                  {placeholder.value}
                </Typography>
              </TableCell>
              {hasTypeColumn && (
                <TableCell>
                  <Typography sx={{ fontWeight: 500, pl: 1, fontSize: 12 }}>
                    Type
                  </Typography>
                </TableCell>
              )}
              {hasDescriptionColumn && (
                <TableCell>
                  <Typography sx={{ fontWeight: 500, pl: 1, fontSize: 12 }}>
                    {placeholder.description}
                  </Typography>
                </TableCell>
              )}
              <TableCell width="60px" />
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td": { borderBottom: 0 }, height: 32 }}
              >
                <TableCell padding="checkbox" sx={{ py: 0.5 }}>
                  <Checkbox
                    checked={item.enabled ?? true}
                    onChange={(e) =>
                      updateRow(index, { enabled: e.target.checked })
                    }
                    size="small"
                  />
                </TableCell>

                {/* Key Column */}
                <TableCell sx={{ py: 0.5 }}>
                  <FakerTextField
                    item={{ ...item, value: item.key }}
                    index={index}
                    updateRow={(i, updated) =>
                      updateRow(i, { key: updated.value })
                    }
                    placeholder={placeholder.key}
                    small
                  />
                </TableCell>

                {/* Value Column */}
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

                          const arrayBuffer = await file.arrayBuffer();
                          const binaryData = new Uint8Array(arrayBuffer);
                          const base64String = uint8ToBase64(binaryData);

                          updateRow(index, {
                            value: base64String,
                            filename: file.name,
                          });
                          e.target.value = "";
                        }}
                      />

                      {item.filename ? (
                        <Tooltip title={item.filename}>
                          <Chip
                            label={item.filename}
                            onDelete={() =>
                              updateRow(index, { value: null, filename: null })
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              maxWidth: 150,
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleChooseFileClick}
                        >
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

                {/* Type Column */}
                {hasTypeColumn && (
                  <TableCell sx={{ py: 0.5 }}>
                    <Select
                      value={item.type || "text"}
                      onChange={(e) =>
                        updateRow(index, { type: e.target.value, value: "" })
                      }
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: 12,
                        height: 28,
                        borderRadius: "4px",
                      }}
                    >
                      {typeOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{ fontSize: 12 }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                )}

                {/* Description Column */}
                {hasDescriptionColumn && (
                  <TableCell sx={{ py: 0.5 }}>
                    <InputBase
                      value={item.description || ""}
                      onChange={(e) =>
                        updateRow(index, { description: e.target.value })
                      }
                      placeholder={placeholder.description}
                      size="small"
                      fullWidth
                      sx={{ fontSize: 12, px: 1, py: 0.5 }}
                    />
                  </TableCell>
                )}

                {/* Delete Button */}
                <TableCell sx={{ py: 0.5 }}>
                  <IconButton
                    onClick={() => handleRemove(index)}
                    size="small"
                    disabled={data.length <= 1}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ p: 0.5, borderTop: 1, borderColor: "divider" }}>
          <Button
            startIcon={<Add />}
            onClick={onAdd}
            size="small"
            sx={{ textTransform: "none", fontSize: 12 }}
          >
            Add Row
          </Button>
        </Box>
      </TableContainer>
    </Box>
  );
};

export default KeyValueTable;
