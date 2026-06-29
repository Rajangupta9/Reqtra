import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { login as authLogin } from "../../Controller/auth"
// import { MicrosoftButton } from './OAuth/Microsoft/MicrosoftButton';

import { PageIcon } from './ReusedComp/PageIcon';
import { HeadingText } from './ReusedComp/Text';
import { GoogleButton } from './OAuth/Google/GoogleButton';
import { useNotification } from '../../ContextApi/NotificationContext';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    const { showNotification } = useNotification();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        if (isValidEmail(email) === false) {
            showNotification("Enter valid Email", 'info')
            return;
        }

        setIsLoading(true);
        try {
            const response = await authLogin({
                email: email,
                password: password
            });

            localStorage.setItem("token", response.accessToken);
            localStorage.setItem("user", JSON.stringify(response.user));
            showNotification("Login Sucessfully", "success")
            navigate('/dashboard');

        } catch (error) {
            // 1. Determine the correct error message string
            let errorMessage = "An unknown error occurred.";
            if (error.response && error.response.data && error.response.data.message) {
                // Use the specific message from your API if it exists
                errorMessage = error.response.data.message;
            } else if (error.message) {
                // Fallback to the general error message
                errorMessage = error.message;
            }
            
            console.error("Login failed:", error); // It's good practice to log the full error object for debugging

            // 2. Pass the string to the notification, not the object
            showNotification(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    return (
        <>
            <PageIcon />


            <HeadingText text={"Welcome back!"} />
            <Typography
                sx={{
                    fontSize: '16px',
                    fontWeight: 400,
                    mb: 4,
                    color: 'text.secondary',
                    textAlign: 'center'
                }}
            >
                Please sign-in to your account
            </Typography>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, width: '100%', mb: 3 }}>
                <GoogleButton />
                {/* <MicrosoftButton/> */}
            </Box>


            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                my: 3
            }}>
                <Box sx={{
                    flex: 1,
                    height: '1px',
                    background: (theme) => alpha(theme.palette.divider, 0.3)
                }} />
                <Typography sx={{
                    px: 2,
                    color: 'text.secondary',
                    fontSize: '14px',
                    fontWeight: 500
                }}>
                    or continue with email
                </Typography>
                <Box sx={{
                    flex: 1,
                    height: '1px',
                    background: (theme) => alpha(theme.palette.divider, 0.3)
                }} />
            </Box>


            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        value={email}
                        size="small"
                        required
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                      
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        size="small"
                        required
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                       
                    />
                    

                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    sx={{
                                        color: 'text.secondary',
                                        '&.Mui-checked': {
                                            color: 'primary.main',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography fontSize="14px" color="text.secondary" component="span">
                                    Remember me
                                </Typography>
                            }
                        />
                        <Link
                            to="/forgot-password"
                            style={{
                                color: 'inherit',
                                fontSize: '14px',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            <Typography
                                component="span"
                                sx={{
                                    color: 'primary.main',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Forgot Password?
                            </Typography>
                        </Link>
                    </Box>


                    <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        disabled={isLoading}
                        sx={{
                            py: 1.5,
                            px: 3,
                            fontSize: '16px',
                            fontWeight: 600,
                           
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>


                    <Typography fontSize="14px" textAlign={'center'} color="text.secondary">
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            style={{
                                color: 'inherit',
                                textDecoration: 'none',
                                fontWeight: 600
                            }}
                        >
                            <Typography
                                component="span"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Sign Up
                            </Typography>
                        </Link>
                    </Typography>
                </Box>
            </form>
        </>
    );
};