import { useState } from "react";
import type { AlertColor } from '@mui/material';

export interface NotificationState {
    message: string;
    open: boolean;
    severity: AlertColor
}

export const useNotification = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<AlertColor>("info");

    const showNotification = (message: string, severity: AlertColor = "info") => {
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
    };

    const closeNotification = () => {
        setOpen(false);
    };

    return {notificationState: {message, open, severity} as NotificationState, showNotification, closeNotification}
}