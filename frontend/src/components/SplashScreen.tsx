import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import logo from '../assets/retrosprite_logo.png';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [onComplete]);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                bgcolor: '#1b2636',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
            }}
        >
            <img src={logo} alt="Retrosprite Logo" style={{ width: '300px', maxWidth: '80%' }} />
        </Box>
    );
};
