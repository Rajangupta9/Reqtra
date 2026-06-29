import React, { useState, useEffect, useCallback, memo } from "react";
import { Box } from "@mui/material";
import { useApp } from "../../../ContextApi/AppContext";
import KeyValueTable from "./keyValueTable";
import { ActionTypes } from "../../../ContextApi/helper/actionTypes";

const HeadersTab = () => {
  const { activeTabData, activeTabId, dispatch } = useApp();
  const { headers } = activeTabData;

  const [localHeaders, setLocalHeaders] = useState(headers || []);


  useEffect(() => {
    setLocalHeaders(headers || []);
  }, [headers]);


  useEffect(() => {
    if (!Array.isArray(localHeaders) || localHeaders.length === 0) {
      addHeaderRow();
      return;
    }

    const last = localHeaders[localHeaders.length - 1];
    const isLastEmpty =
      last.key === "" && last.value === "" && last.description === "";

    if (!isLastEmpty) addHeaderRow();
  }, [localHeaders]); 

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


  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(localHeaders) !== JSON.stringify(headers)) {
        dispatch({
          type: ActionTypes.UPDATE_HEADERS,
          payload: { tabId: activeTabId, headers: localHeaders },
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localHeaders, headers, dispatch, activeTabId]);

  return (
    <Box>
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
        hasDescriptionColumn
      />
    </Box>
  );
};

export default memo(HeadersTab);
