import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  Tooltip,
  Stack,
  InputAdornment,
  IconButton,
  Button,
  ListSubheader,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { DeleteOutline } from "@mui/icons-material";
import { getMethodColor } from "../Common/getMethodColour";
import { useApp } from "../../ContextApi/AppContext";
import { historyController } from "../../Controller/history";
import { mapHistoryResponseToState } from "../../ContextApi/helper/mapApiRequestToState";

const renderMethodBadge = (method) => (
  <Typography
    variant="caption"
    sx={{
      display: "inline-block",
      fontWeight: "bold",
      fontSize: "10px",
      px: "6px",
      py: "2px",
      borderRadius: "4px",
      letterSpacing: "0.5px",
      color: getMethodColor(method),
    }}
  >
    {method?.toUpperCase()}
  </Typography>
);

const groupHistoryByDate = (history) => {
  const groups = {};
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);

    if(history !== null && history.length > 0){
       history.forEach((item) => {
    const itemDate = new Date(item.createdAt * 1000);
    const itemDateStr = formatDate(itemDate);
    const key =
      itemDateStr === todayStr
        ? "TODAY"
        : itemDateStr === yesterdayStr
          ? "YESTERDAY"
          : itemDateStr;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
    }

  return groups;
};

const fetchHistory = async (userId, workspaceId, page, limit = 20) => {
  if (!userId) return { data: [], hasMore: false };
  try {
    const res = await historyController.getUserHistory(userId, workspaceId, page, limit);

    return res;
  } catch (err) {
    console.error("Failed to fetch history:", err);
    return { data: [], hasMore: false };
  }
};

const HistoryListItem = React.memo(({ req, onLoad, onDelete }) => {
  const requestTime = new Date(req.createdAt * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <IconButton edge="end" aria-label="delete" onClick={() => onDelete(req.id)}>
          <DeleteOutline fontSize="small" />
        </IconButton>
      }
      sx={{
        "&:hover .MuiListItemSecondaryAction-root": { visibility: "visible" },
        ".MuiListItemSecondaryAction-root": { visibility: "hidden" },
      }}
    >
      <ListItemButton onClick={() => onLoad(req)} sx={{ py: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
          <ListItemIcon sx={{ minWidth: "auto" }}>
            {renderMethodBadge(req.method)}
          </ListItemIcon>

          <ListItemText
            primary={
              // <Tooltip title={req.url} placement="top-start">
              <Typography noWrap>{req.url}</Typography>
              // </Tooltip>
            }
            // secondaryTypographyProps={{ component: "div" }}
            slotProps={{
              secondary: {
                component: 'div',
              },
            }}
            secondary={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="caption"
                  color={
                    req.statusCode >= 200 && req.statusCode < 400
                      ? "success.main"
                      : "error.main"
                  }
                >
                  {req.statusCode}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                  &bull;
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {requestTime}
                </Typography>
              </Stack>
            }
          />
        </Stack>
      </ListItemButton>
    </ListItem>
  );
});

export const HistoryPanel = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const { selectedWorkspace, addTab, historyVersion, history, setHistory } = useApp();
  const listRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedWorkspace) {
        setHistory([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const { data, hasMore } = await fetchHistory(user?.id, selectedWorkspace.id, 1);
      setHistory(data);
      setHasMore(hasMore);
      setPage(1);
      setLoading(false);
    };

    loadHistory();
  }, [historyVersion, selectedWorkspace]);

  // ---------------- Scroll event for pagination ----------------
  const handleScroll = useCallback(async (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 20;

    if (bottom && hasMore && !loading) {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const nextPage = page + 1;
      const { data: newData, hasMore: newHasMore } = await fetchHistory(
        user?.id,
        selectedWorkspace.id,
        nextPage
      );
      setHistory((prev) => [...prev, ...newData]);
      setHasMore(newHasMore);
      setPage(nextPage);
      setLoading(false);
    }
  }, [hasMore, loading, page, selectedWorkspace]);

  // ---------------- Handlers ----------------
  const handleLoadRequest = useCallback(
    (req) => {
      const payload = mapHistoryResponseToState({
        ...req.request,
        response: req.response,
        type: "history",
      });
      addTab(null, payload, req.id);
    },
    [addTab]
  );

  const handleDeleteRequest = useCallback(async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) return;
      await historyController.deleteHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Failed to delete history:", err);
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) return;
      await historyController.clearUserHistory(user.id, selectedWorkspace.id);
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }, [selectedWorkspace]);

  // ---------------- Filter + grouping ----------------
  const groupedHistory = useMemo(() => {
    const filtered = search
      ? history.filter(
        (r) =>
          r.url?.toLowerCase().includes(search.toLowerCase()) ||
          r.method?.toLowerCase().includes(search.toLowerCase())
      )
      : history;
    return groupHistoryByDate(filtered);
  }, [history, search]);

  const dateKeys = Object.keys(groupedHistory);

  // ---------------- No workspace selected ----------------
  if (!selectedWorkspace) {
    return (
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          color: "text.secondary",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Typography>Please select a workspace to view history.</Typography>
      </Box>
    );
  }

  // ---------------- UI ----------------
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 1.5, flexShrink: 0 }}
      >
        <Typography variant="h6" fontWeight={700}>
          History
        </Typography>
        {history !== null && history.length > 0 && (
          <Button size="small" color="error" onClick={handleClearAll} variant="text">
            Clear All
          </Button>
        )}
      </Stack>

      {/* Search */}
      <Box sx={{ px: 1.5, pb: 1, flexShrink: 0 }}>
        <TextField
          size="small"
          placeholder="Filter"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider />

      {/* Scrollable List */}
      <Box
        ref={listRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          height: "100%",
          overflowX: "hidden",
          scrollBehavior: "smooth",
        }}
        onScroll={handleScroll}
      >
        {loading && history !== null && history.length === 0 ? (
          <Typography sx={{ p: 2, color: "text.secondary" }}>Loading history...</Typography>
        ) : dateKeys.length > 0 ? (
          <List dense disablePadding>
            {dateKeys.map((dateKey) => (
              <Box key={dateKey}>
                <ListSubheader component="div" sx={{ bgcolor: "background.paper" }}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ textTransform: "uppercase" }}
                  >
                    {dateKey}
                  </Typography>
                </ListSubheader>
                {groupedHistory[dateKey].map((req) => (
                  <HistoryListItem
                    key={req.id}
                    req={req}
                    onLoad={handleLoadRequest}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </Box>
            ))}
            {loading && hasMore && (
              <Typography sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
                Loading more...
              </Typography>
            )}
          </List>
        ) : (
          <Typography sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
            No history records found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

