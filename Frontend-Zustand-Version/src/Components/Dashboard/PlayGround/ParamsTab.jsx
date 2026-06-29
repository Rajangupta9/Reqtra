import React, { memo, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useAppStore } from "../../../Store/useAppStore";
import KeyValueTable from "./keyValueTable";

const ParamsTab = () => {
  const params = useAppStore(
    (state) => state.activeTabData()?.request?.params || []
  );
  const updateParams = useAppStore((state) => state.updateParams);

  const [localParams, setLocalParams] = useState(params);

  // Keep local state in sync with global state
  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  // Debounced sync back to store
  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(localParams) !== JSON.stringify(params)) {
        updateParams(localParams);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [localParams, params, updateParams]);

  const handleParamsChange = (newParams) => {
    setLocalParams(newParams);
  };

  const handleAddParam = () => {
    setLocalParams([
      ...localParams,
      { key: "", value: "", description: "", enabled: true },
    ]);
  };

  const handleRemoveParam = (index) => {
    setLocalParams(localParams.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <KeyValueTable
        data={localParams}
        onChange={handleParamsChange}
        onAdd={handleAddParam}
        onRemove={handleRemoveParam}
        title="Query Parameters"
        placeholder={{
          key: "Parameter name",
          value: "Parameter value",
          description: "Description",
        }}
      />
    </Box>
  );
};

export default memo(ParamsTab);
