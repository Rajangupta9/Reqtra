import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import RequestListItem from "./RequestListItem";
import { useApp } from "../../../ContextApi/AppContext";

import {  DndContext,  closestCenter,  PointerSensor,  useSensor,  useSensors,  DragOverlay} from"@dnd-kit/core";
import { SortableContext, useSortable,  verticalListSortingStrategy,  arrayMove,} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Sequence = () => {
  const { activeTabData, setActiveTabRequests } = useApp();
  const tabdata = activeTabData;
  const [flatRequests, setFlatRequests] = useState([]);
  const [activeId, setActiveId] = useState(null);

 
  const flattenRequests = (items, path = []) => {
    let flatList = [];
    for (const item of items) {
      if (item.request && item.type === "request") {
        flatList.push({
          ...item,
          folderPath: path,
          checked: item.checked ?? false,
        });
      }
      if (item.type === "folder" && item.children) {
        const newPath = [...path, item.name];
        flatList = flatList.concat(flattenRequests(item.children, newPath));
      }
    }
    return flatList;
  };

  useEffect(() => {
    if (!tabdata?.requests) return;
    const flattened = flattenRequests(tabdata.requests);
    setFlatRequests(flattened);
    setActiveTabRequests(activeTabData.id, flattened);
  }, [activeTabData.id]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = flatRequests.findIndex((r) => r.requestId === active.id);
    const newIndex = flatRequests.findIndex((r) => r.requestId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(flatRequests, oldIndex, newIndex);
    setFlatRequests(reordered);
    setActiveTabRequests(activeTabData.id, reordered);
    setActiveId(null);
  };

  const handleSelectAll = () => {
    const updated = flatRequests.map((r) => ({ ...r, checked: true }));
    setFlatRequests(updated);
    setActiveTabRequests(activeTabData.id, updated);
  };

  const handleDeselectAll = () => {
    const updated = flatRequests.map((r) => ({ ...r, checked: false }));
    setFlatRequests(updated);
    setActiveTabRequests(activeTabData.id, updated);
  };

  const handleReset = () => {
    const flattened = flattenRequests(tabdata.requests);
    const updated = flattened.map((r) => ({ ...r, checked: false }));
    setFlatRequests(updated);
    setActiveTabRequests(activeTabData.id, updated);
  };

  const handleToggle = (requestId) => {
    console.log(requestId)
    const updated = flatRequests.map((r) =>
      r.requestId === requestId ? { ...r, checked: !r.checked } : r
    );
    setFlatRequests(updated);
    setActiveTabRequests(activeTabData.id, updated);
  };

  const activeItem = flatRequests.find((r) => r.requestId === activeId);

  return (
    <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          p: 2,
          borderRight: 1,
          borderColor: "divider",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Run Sequence
          </Typography>
          <Box>
            <Button size="small" onClick={handleDeselectAll}>Deselect All</Button>
            <Button size="small" onClick={handleSelectAll}>Select All</Button>
            <Button size="small" onClick={handleReset}>Reset</Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

      
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={flatRequests.map((r) => r.requestId)}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
              {flatRequests.map((req, index) => (
                <>
                
                <SortableRequestListItem
                  key={req.requestId}
                  item={req}
                  checked={req.checked || false}
                  onToggle={() => handleToggle(req.requestId)}
                />
                </>
              ))}
            </Box>
          </SortableContext>

          {/* Overlay while dragging */}
          <DragOverlay>
            {activeItem ? (
              <RequestListItem item={activeItem} checked={activeItem.checked} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>
    </Box>
  );
};


const SortableRequestListItem = ({ item, checked, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.requestId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <RequestListItem
        item={item}
        checked={checked}
        onToggle={onToggle}
        dragHandleProps={listeners} 
      />
    </div>
  );
};

