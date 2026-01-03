import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { BrowserOpenURL } from '../wailsjs/runtime/runtime';
import UpdateIcon from '@mui/icons-material/Update';

interface UpdateDialogProps {
    open: boolean;
    onClose: () => void;
    updateInfo: {
        currentVersion: string;
        latestVersion: string;
        releaseName: string;
        releaseNotes: string;
        downloadUrl: string;
    } | null;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({ open, onClose, updateInfo }) => {
    if (!updateInfo) return null;

    const handleDownload = () => {
        BrowserOpenURL(updateInfo.downloadUrl);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UpdateIcon color="primary" />
                Update Available
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        <strong>{updateInfo.releaseName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Version {updateInfo.latestVersion} is now available. You are currently using version {updateInfo.currentVersion}.
                    </Typography>
                </Box>

                {updateInfo.releaseNotes && (
                    <Box sx={{
                        bgcolor: 'background.default',
                        p: 2,
                        borderRadius: 1,
                        maxHeight: 200,
                        overflow: 'auto'
                    }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            RELEASE NOTES:
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {updateInfo.releaseNotes}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Later
                </Button>
                <Button onClick={handleDownload} variant="contained" color="primary">
                    Download Update
                </Button>
            </DialogActions>
        </Dialog>
    );
};
