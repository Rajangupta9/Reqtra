import { MsalProvider } from "@azure/msal-react"
import { alpha, Box, Container } from "@mui/material"
// import { msalInstance } from "../OAuth/Microsoft/MIcrosoftCofig"




export const AuthWrapper = ({children}) =>{

    return (
            // <MsalProvider instance={msalInstance}>
                    <Box sx={{
                        width: '100vw',
                        height: '100vh',
                        display: "flex",
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: (theme) => theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 50%, #17181C 100%)'
                            : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: (theme) => theme.palette.mode === 'dark'
                                ? 'radial-gradient(circle at 30% 20%, rgba(13, 110, 253, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 69, 255, 0.08) 0%, transparent 50%)'
                                : 'radial-gradient(circle at 30% 20%, rgba(13, 110, 253, 0.06) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 69, 255, 0.04) 0%, transparent 50%)',
                            pointerEvents: 'none',
                        }
                    }}>
                        <Container
                            maxWidth={false}
                            sx={{
                                maxWidth: '680px',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
                                backdropFilter: 'blur(20px)',
                                padding: 0,
                                boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                    : '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    maxWidth: '360px',
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: 4,
                                    position: 'relative',
                                }}
                            >
                                 {children}
                            </Box>
                        </Container>
                    </Box>
                // </MsalProvider>
    )
    
}