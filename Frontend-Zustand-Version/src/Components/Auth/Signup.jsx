import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, alpha } from '@mui/material';
import { signup } from '../../Controller/auth';
// import { MicrosoftButton } from './OAuth/Microsoft/MicrosoftButton';
import { PageIcon } from './ReusedComp/PageIcon';
import { HeadingText } from './ReusedComp/Text';
import { GoogleButton } from './OAuth/Google/GoogleButton';
import { useNotification } from '../../ContextApi/NotificationContext';


export const Signup = () => {

    const {showNotification} = useNotification();
    const [formdata, setformdata] = useState({
        name: '',
        email: "",
        password: '',
        confirmPassword: '',
        checkbox: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        if (!formdata.checkbox) {
            showNotification("You must agree to terms" , 'info')
        
            return;
        }
        if (formdata.password !== formdata.confirmPassword) {
            showNotification("Password is not matched with confirm Password" , 'info')
            return;
        }
        console.log(formdata)
        if (isValidEmail(formdata.email) === false) {
            showNotification("Enter your valid Email" , 'info')
            return;
        }

        setIsLoading(true);
        try {
            const response = await signup({
                username: formdata.name,
                email: formdata.email,
                password: formdata.password
            });

            console.log(response);
            localStorage.setItem("token", response.accessToken);
            localStorage.setItem("user", JSON.stringify(response.user));
            
            showNotification("Sign up successful" , 'success')
            
            navigate('/dashboard');

        } catch (error) {
            console.log(error);
            showNotification(error , 'error')
       
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

            <HeadingText text={"Welcome to Reqtra!"} />

            <Typography
                sx={{
                    fontSize: '16px',
                    fontWeight: 400,
                    mb: 4,
                    color: 'text.secondary',
                    textAlign: 'center'
                }}
            >
                Get started – it's free
            </Typography>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, width: '100%', mb: 2 }}>
                <GoogleButton />
                {/* <MicrosoftButton /> */}
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
                    or
                </Typography>
                <Box sx={{
                    flex: 1,
                    height: '1px',
                    background: (theme) => alpha(theme.palette.divider, 0.3)
                }} />
            </Box>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Name"
                        variant="outlined"
                        value={formdata.name}
                        size="small"
                        required
                        onChange={(e) => setformdata({
                            ...formdata, name: e.target.value
                        })}
                       
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        value={formdata.email}
                        size="small"
                        required
                        onChange={(e) => setformdata({
                            ...formdata, email: e.target.value
                        })}
                        
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type='password'
                        variant="outlined"
                        value={formdata.password}
                        size="small"
                        required
                        onChange={(e) => setformdata({
                            ...formdata, password: e.target.value
                        })}
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        variant="outlined"
                        type='password'
                        value={formdata.confirmPassword}
                        size="small"
                        required
                        onChange={(e) => setformdata({
                            ...formdata, confirmPassword: e.target.value
                        })}
                        
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <FormControlLabel

                            checked={formdata.checkbox}
                            onChange={(e) => setformdata({
                                ...formdata, checkbox: e.target.checked
                            })}
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
                                <Typography fontSize="14px" sx={{
                                    color: 'text.secondary'
                                }}>
                                    By proceeding, you agree to the{' '}
                                    <Link
                                        to="/term"
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
                                            Terms of Service
                                        </Typography>
                                    </Link>
                                    {' '}and{' '}

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
                                            Privacy Policy
                                        </Typography>
                                    </Link>
                                    .
                                </Typography>
                            }
                        />
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
                        {isLoading ? 'Signing in...' : 'Sign Up'}
                    </Button>

                    <Typography fontSize="14px" textAlign={'center'} color="text.secondary">
                        Already have an account?{' '}
                        <Link
                            to="/login"
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
                                Log in
                            </Typography>
                        </Link>
                    </Typography>

                </Box>
            </form>
        </>
    );
};