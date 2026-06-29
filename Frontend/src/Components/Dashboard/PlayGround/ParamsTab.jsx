import React, { memo, useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useApp } from '../../../ContextApi/AppContext';
import KeyValueTable from './keyValueTable';
import { ActionTypes } from '../../../ContextApi/helper/actionTypes';

const ParamsTab = () => {
  const { dispatch, activeTabData, activeTabId } = useApp();
  const { params } = activeTabData;

  const [localParams, setLocalParams] = useState(params || []);

  // Sync with context
  useEffect(() => {
    setLocalParams(params || []);
  }, [params, activeTabId]);

  // Ensure at least one empty row exists
  useEffect(() => {
    if (!Array.isArray(localParams) || localParams.length === 0) {
      addParamRow();
      return;
    }

    const last = localParams[localParams.length - 1];
    const isLastEmpty =
      last.key === '' && last.value === '' && last.description === '';

    if (!isLastEmpty) addParamRow();
  }, [localParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced context update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(localParams) !== JSON.stringify(params)) {
        dispatch({ type: ActionTypes.UPDATE_PARAMS, payload: { tabId: activeTabId, params: localParams } });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [localParams, params, activeTabId, dispatch]);

  const handleParamsChange = useCallback((newParams) => setLocalParams(newParams), []);

  const addParamRow = useCallback(() => {
    setLocalParams(prev => [...prev, { key: '', value: '', description: '', enabled: true }]);
  }, []);

  const removeParamRow = useCallback((index) => {
    setLocalParams(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  return (
    <Box>
      <KeyValueTable
        data={localParams}
        onChange={handleParamsChange}
        onAdd={addParamRow}
        onRemove={removeParamRow}
        title="Query Parameters"
        placeholder={{
          key: 'Parameter name',
          value: 'Parameter value',
          description: 'Description',
        }}
        hasDescriptionColumn
      />
    </Box>
  );
};

export default memo(ParamsTab);
