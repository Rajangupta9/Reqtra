import { alpha, Button, CircularProgress } from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLoginAPI } from "../../../../Controller/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useNotification } from "../../../../ContextApi/NotificationContext";

export const GoogleButton = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const {showNotification}= useNotification();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const backendResponse = await googleLoginAPI({
          token: tokenResponse.access_token,
        });

        localStorage.setItem("token", backendResponse.accessToken);
        localStorage.setItem("user", JSON.stringify(backendResponse.user));
        
        showNotification("Login Successful" , 'success')
        
        navigate("/dashboard");
      } catch (error) {
        console.error("Google login backend error:", error);
        const errorMessage =
          error.response?.data?.error || "Google login failed";
          showNotification(errorMessage , 'error')
        
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      showNotification("Google login failed" , 'error')
      setIsLoading(false);
    },
  });

  return (
    <Button
      onClick={() => googleLogin()}
      variant="outlined"
      disabled={isLoading}
      sx={{
        flex: 1,
        textTransform: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 1.5,
        px: 2,
        borderRadius: "12px",
        border: (theme) => `1.5px solid ${alpha(theme.palette.divider, 0.3)}`,
        backgroundColor: "transparent",
        color: "text.primary",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          border: (theme) => `1.5px solid ${theme.palette.primary.main}`,
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
          boxShadow: (theme) =>
            `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
        "&:disabled": {
          opacity: 0.6,
          cursor: "not-allowed",
        },
      }}
    >
      {isLoading ? (
        <CircularProgress size={20} sx={{ color: "text.secondary" }} />
      ) : (
        <>
          <img
            src="google.svg"
            alt="Google"
            style={{ width: 20, height: 20, marginRight: 8 }}
          />
          Google
        </>
      )}
    </Button>
  );
};
