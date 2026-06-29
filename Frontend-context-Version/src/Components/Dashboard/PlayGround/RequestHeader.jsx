import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Typography,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import {  SendOutlined, SaveOutlined, TableRowsOutlined } from "@mui/icons-material";
import { useApp } from "../../../ContextApi/AppContext";
import { useNotification } from "../../../ContextApi/NotificationContext";
import { requestController } from "../../../Controller/request";
import { mapStateToApiRequest } from "../../../ContextApi/helper/stateTopayload";
import { debounce } from "../../../utils/debounce";
import EnvironmentDrawer from "./EnvironmentDrawer";
import { getMethodColor } from "../../Common/getMethodColour";



const API_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const RequestHeader = () => {

    const { dispatch, sendRequest, activeTabData, 
        selectedItem, activeTabId , renameDialogOpen} = useApp();
    const { showNotification } = useNotification();

    const { method = "GET", url = "", loading = false } = activeTabData;


    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [requestName, setRequestName] = useState("");
    const [envDrawerOpen, setEnvDrawerOpen] = useState(false);
    const [locUrl, setLocUrl] = useState("");
   
    const mockEnvironments = [];

    const handleUrlChange = (event) => {
        const value = event.target.value;
        setLocUrl(value);
        debouncedDispatch(value);
    };

    const handleMethodChange = (event) => {
        dispatch({
            type: "SET_METHOD",
            payload: { tabId: activeTabId, value: event.target.value },
        });
    };

    const handleOpenSaveDialog = () => {
        setRequestName(activeTabData?.name || "");
        setSaveDialogOpen(true);
    };

    const handleCloseSaveDialog = () => {
        setSaveDialogOpen(false);
        setRequestName("");
    };

    const handleConfirmSave = async () => {

        try {
            const updatedData = { ...activeTabData };
            const payload = mapStateToApiRequest(updatedData);
             
            console.log(updatedData)
            console.log(payload)

            await requestController.updateRequstwithId(selectedItem?.id, payload);
            showNotification("Request updated successfully", "success");
        } catch (error) {
            showNotification("Failed to update request", "error");
        } finally {
            handleCloseSaveDialog();
        }
    };




    useEffect(() => {
        setLocUrl(url || "");
    }, [url]);

  



    const debouncedDispatch = useCallback(
        debounce((value) => {
            dispatch({ type: "SET_URL", payload: { tabId: activeTabId, value } });
        }, 300),
        [dispatch, activeTabId]
    );

useEffect(() => {
    const handleKeyDown = async (e) => {
        
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s"  && !renameDialogOpen) {
            
            e.preventDefault();

           
            if (loading) return;

          
            if (selectedItem && activeTabData.id && selectedItem.id !== activeTabData.id) {
                showNotification(
                    "Save conflict: The selected request doesn't match the active tab.",
                    "warning"
                );
                return; 
            }

            
            if (selectedItem?.id) {
                try {
                    const payload = mapStateToApiRequest(activeTabData);
                 
                    await requestController.updateRequstwithId(selectedItem.id, payload);
                    showNotification("Request saved!", "success");
                } catch (error) {
                    console.error("Quick save failed:", error);
                    showNotification("Failed to save request", "error");
                }
            } else {
      
                handleOpenSaveDialog();
            }
        }
        else if(e.ctrlKey && e.key === 'Enter' && !renameDialogOpen) {
            e.preventDefault();
            if (!loading) {
                sendRequest();
            }
        }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
        document.removeEventListener("keydown", handleKeyDown);
    };
   
}, [activeTabData, selectedItem, loading]);

    return (
        <Box>


            {/* Request Input Bar */}
            <Box sx={{ display: "flex", mb: 2, alignItems: "center", gap: 1 }}>
                <Box sx={{ display: "flex", width: "100%" }}>
                    <FormControl sx={{ minWidth: 120 }}>
                        <Select
                            value={method}
                            onChange={handleMethodChange}
                            sx={{
                                height: 44,
                                borderRadius: "8px",
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            }}
                            renderValue={(selected) => (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: "12px",
                                        px: "8px",
                                        py: "3px",
                                        borderRadius: "8px",
                                        // bgcolor: `${getMethodColor(selected)}20`,
                                        color: getMethodColor(selected),
                                        textAlign: "center",
                                        minWidth: 60,
                                    }}
                                >
                                    {selected}
                                </Typography>
                            )}
                        >
                            {API_METHODS.map((m) => (
                                <MenuItem key={m} value={m}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "inline-block",
                                            fontWeight: 600,
                                            fontSize: "12px",
                                            px: "8px",
                                            py: "3px",
                                            borderRadius: "8px",
                                            // bgcolor: `${getMethodColor(m)}20`,
                                            color: getMethodColor(m),
                                            textAlign: "center",
                                            minWidth: 60,
                                        }}
                                    >
                                        {m}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        value={locUrl}
                        onChange={handleUrlChange}
                        placeholder="Enter request URL"
                        fullWidth
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: 44,
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                            },
                        }}
                    />
                </Box>

                <Button
                    onClick={sendRequest}
                    disabled={loading || !url.trim()}
                    variant="contained"
                    sx={{ height: 44, px: 3, fontWeight: 600, borderRadius: "8px" }}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendOutlined />}
                >
                    {loading ? "Sending..." : "Send"}
                </Button>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveOutlined />}
                    onClick={handleConfirmSave}
                    disabled={!url.trim() || !selectedItem || selectedItem.id !== activeTabData.id}
                    sx={{
                        bgcolor: "background.paper",
                        boxShadow: "none",
                        color: "text.primary",
                        "&:hover": { bgcolor: "action.hover" },
                    }}
                >
                    Save
                    
                </Button>


                <Button
                    variant="contained"
                    size="small"
                    startIcon={<TableRowsOutlined />}
                    onClick={() => setEnvDrawerOpen(true)}
                    sx={{
                        bgcolor: "background.paper",
                        boxShadow: "none",
                        color: "text.primary",
                        "&:hover": { bgcolor: "action.hover" },
                    }}
                >
                    Env
                </Button>
            </Box>


          
           

            <EnvironmentDrawer
                open={envDrawerOpen}
                onClose={() => setEnvDrawerOpen(false)}
                initialEnvironments={mockEnvironments}
            />
        </Box>
    );
};

export default RequestHeader;
