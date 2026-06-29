import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { microsoftLogin } from "../../../../Controller/auth";
import { alpha, Button } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../ContextApi/NotificationContext";


export const MicrosoftButton = () => {
    const { instance } = useMsal();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const {showNotification} = useNotification();


    const onSuccess = (userData) => {
        localStorage.setItem("token", userData.accessToken);
        localStorage.setItem("user", JSON.stringify(userData.user));
        console.log("Microsoft login successful:", userData.user);

        showNotification("Login Successful" , 'success')
       
        navigate('/dashboard');
    };

    const onError = (error) => {
        console.error("Microsoft login error:", error);
        showNotification("Microsoft login failed", 'error')
        
    };

    const handleMicrosoftLogin = async () => {
        if (isLoading) return;

        setIsLoading(true);
        const loginRequest = {
            scopes: ["User.Read"],
        };

        try {
            const response = await instance.loginPopup(loginRequest);

            const tokenResponse = await instance.acquireTokenSilent({
                scopes: ["User.Read"],
                account: response.account,
            }).catch(() =>
                instance.acquireTokenPopup({
                    scopes: ["User.Read"],
                })
            );

            const backendResponse = await microsoftLogin({
                accessToken: tokenResponse.accessToken,
                account: response.account
            });

            onSuccess(backendResponse);
        } catch (error) {
            console.error("Microsoft login error:", error);
            onError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            variant="outlined"
            sx={{
                flex: 1,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 1.5,
                px: 2,
                borderRadius: '12px',
                border: (theme) => `1.5px solid ${alpha(theme.palette.divider, 0.3)}`,
                backgroundColor: 'transparent',
                color: 'text.primary',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    border: (theme) => `1.5px solid ${theme.palette.primary.main}`,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
                '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed'
                }
            }}
        >

            <img src='microsoft.svg' alt="Microsoft" style={{ width: 20, height: 20, marginRight: 8 }} />
            {'Microsoft'}
        </Button>
    );
};