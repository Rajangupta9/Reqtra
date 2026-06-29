import React, { useState, useEffect, useCallback, memo } from "react";
import { Box, Typography } from "@mui/material";
import { useAppStore } from "../../../Store/useAppStore";
import KeyValueTable from "./keyValueTable";

const HeadersTab = () => {
  const headers = useAppStore(
    (state) => state.activeTabData()?.request?.headers || []
  );
  const updateHeaders = useAppStore((state) => state.updateHeaders);

  const [localHeaders, setLocalHeaders] = useState(headers);

  // Keep local in sync with store
  useEffect(() => {
    setLocalHeaders(headers);
  }, [headers]);

  // Debounced update back to store
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(localHeaders) !== JSON.stringify(headers)) {
        updateHeaders(localHeaders);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localHeaders, headers, updateHeaders]);

  // Add/remove header rows
  const addHeaderRow = useCallback(() => {
    setLocalHeaders((prev) => [
      ...prev,
      { key: "", value: "", description: "", enabled: true },
    ]);
  }, []);

  const removeHeaderRow = useCallback((index) => {
    setLocalHeaders((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  }, []);

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        Request Headers
      </Typography>

      <KeyValueTable
        data={localHeaders}
        onChange={setLocalHeaders}
        onAdd={addHeaderRow}
        onRemove={removeHeaderRow}
        title="Headers"
        placeholder={{
          key: "Header name",
          value: "Header value",
          description: "Description",
        }}
      />
    </Box>
  );
};

export default memo(HeadersTab);
