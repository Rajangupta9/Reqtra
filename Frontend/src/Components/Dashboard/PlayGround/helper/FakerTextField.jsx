import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  TextField,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  InputBase,
} from "@mui/material";
import { fakerOptions } from "./FakerOption";

export default function FakerTextField({
  item = {},
  index = 0,
  updateRow = () => { },
  placeholder = "Enter text...", 
}) {
  const [value, setValue] = useState(item.value || "");
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState(null);
  const [triggerPosition, setTriggerPosition] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItemRef = useRef(null);

  useEffect(() => {
    setValue(item.value || "");
  }, [item.value]);

  const filteredOptions = useMemo(() => {
    if (search === null) return [];
    return fakerOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(search) ||
        opt.value.toLowerCase().includes(search)
    );
  }, [search]);

  const showDropdown = Boolean(anchorEl) && filteredOptions.length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  useEffect(() => {
    if (showDropdown && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex, showDropdown]);

  const insertOption = useCallback(
    (option) => {
      if (triggerPosition === null || !anchorEl) return;

      const cursorPos = anchorEl.selectionStart;
      const beforeTrigger = value.substring(0, triggerPosition);
      // The text after the point where the autocomplete suggestion should be inserted
      const afterAutocomplete = value.substring(cursorPos);

      const newValue = `${beforeTrigger}${option.value}${afterAutocomplete}`;

      setValue(newValue);
      updateRow(index, { value: newValue });

      // Clean up state to hide the dropdown
      setAnchorEl(null);
      setSearch(null);
      setTriggerPosition(null);
    },
    [value, anchorEl, triggerPosition, index, updateRow]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!showDropdown) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % filteredOptions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(
            (prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length
          );
          break;
        case "Enter":
        case "Tab": // Allow selecting with Tab as well
          e.preventDefault();
          if (filteredOptions[activeIndex]) {
            insertOption(filteredOptions[activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setAnchorEl(null);
          setSearch(null);
          break;
        default:
          break;
      }
    },
    [showDropdown, activeIndex, filteredOptions, insertOption]
  );

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    updateRow(index, { value: newValue });

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastTrigger = textBeforeCursor.lastIndexOf("{{");

    // Show dropdown if '{{' is typed and not yet closed with '}}'
    if (
      lastTrigger !== -1 &&
      !textBeforeCursor.substring(lastTrigger).includes("}}")
    ) {
      const searchText = textBeforeCursor.substring(lastTrigger + 2);
      setSearch(searchText.toLowerCase());
      setTriggerPosition(lastTrigger);
      setAnchorEl(e.currentTarget);
    } else {
      setAnchorEl(null);
      setSearch(null);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <InputBase
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="small"
        fullWidth
        type={item.type === "password" ? "password" : "text"}
        sx={{
          px: 1,
          py: 0.5,
          borderRadius: '4px',
          fontSize: '12px',
          transition: 'background-color 0.1s ease, box-shadow 0.1s ease',
          '& input::placeholder': { opacity: 0.45 },
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          '&.Mui-focused': {
            backgroundColor: 'action.hover',
            boxShadow: 'inset 0 0 0 1.5px rgba(79,142,247,0.45)',
          },
        }}
      />

      <Popper
        open={showDropdown}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ zIndex: 1300, width: anchorEl ? anchorEl.clientWidth : "auto" }}
      >
        <Paper elevation={3} sx={{ maxHeight: 200, overflow: "auto" }}>
          <List dense>
            {filteredOptions.map((opt, idx) => (
              <ListItem key={opt.value} disablePadding>
                <ListItemButton
                  ref={activeIndex === idx ? activeItemRef : null}
                  selected={activeIndex === idx}
                  onClick={() => insertOption(opt)}
                  // This line makes the item active on hover
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <ListItemText primary={opt.label} 
                  // secondary={opt.value} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popper>
    </Box>
  );
}