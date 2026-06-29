import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import {
  Close,
  PersonRemoveOutlined,
} from "@mui/icons-material";
import { workspaceController } from "../../Controller/workspace";
import { useNotification } from "../../ContextApi/NotificationContext";

export default function EditWorkspaceDialog({ open, onClose, workspace }) {
  const [members, setMembers] = useState([]);

   const { showNotification } = useNotification();

  useEffect(() => {
    if (workspace) {
   
      const ownerIds = workspace.owner?.map((o) => o.id) || [];
      const memberData =
        workspace.memberDetails?.map((m) => ({
          id: m.id,
          email: m.email,
          username: m.username,
          role: ownerIds.includes(m.id) ? "OWNER" : "MEMBER",
        })) || [];
      setMembers(memberData);
    }
  }, [workspace]);

  const handleRemove = async(id, email) => {
    console.log(email)
    try {
      await workspaceController.UpdateWorkspace({
        id: workspace.id,
        removeMemberEmail: email,
      });
      showNotification("Member removed successfully!", "success");
    } catch (error) {
      console.error("Error removing member:", error);
      showNotification("Failed to remove member", "error");

    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={{ maxHeight: '500px' }}>
      <DialogTitle
        sx={{
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        Edit Workspace
        <IconButton size="small" onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 0.5, display: "block" }}
        >
          Workspace Name
        </Typography>
        {/* <TextField
          fullWidth
          size="small"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter workspace name"
          sx={{ mb: 2 }}
        /> */}
        <Typography variant="h6" sx={{mb:2}}>{workspace?.name}</Typography>
        {/* Members */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 1, display: "block" }}
        >
          Members
        </Typography>

        {members.map((member) => (
          <Box
            key={member.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {member.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {member.email}
              </Typography>
            </Box>

           

            <Box sx={{display:'flex' , gap:2}}>

            <Chip label={member.role} variant="outlined" size="small"/>

            {member.role !== "OWNER" && <IconButton
              size="small"
              color="error"
              onClick={() => handleRemove(member.id, member.email)}
            >
              <PersonRemoveOutlined fontSize="small" />
            </IconButton>}
            </Box>
          </Box>
        ))}

   
        {/* <Button
          variant="outlined"
          startIcon={<PersonAddOutlined />}
          size="small"
          sx={{ textTransform: "none" }}
        >
          Invite
        </Button> */}
      </DialogContent>

      {/* <Divider sx={{ my: 1 }} /> */}

      {/* <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ textTransform: "none", borderRadius: "8px" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="small"
          sx={{
            textTransform: "none",
            borderRadius: "8px",
          }}
        >
          Save
        </Button>
      </DialogActions> */}
    </Dialog>
  );
}
