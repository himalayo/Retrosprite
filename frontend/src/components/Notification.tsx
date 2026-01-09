import { Snackbar, Alert } from "@mui/material";
import type { NotificationState } from "../hooks/useNotification";

export default function Notification({state, closeNotification}: {state: NotificationState, closeNotification: () => void}) {
    return (
        <Snackbar open={state.open} autoHideDuration={6000} onClose={closeNotification}>
            <Alert onClose={closeNotification} severity={state.severity} sx={{ width: '100%' }}>
                {state.message}
            </Alert>
        </Snackbar>
    )
}