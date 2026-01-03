import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Button, IconButton } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import logo from '../assets/retrosprite_logo.png';

interface RecentProjectsProps {
    recentProjects: string[];
    onOpenPath: (path: string) => void;
    onOpenProject: () => void;
    onOpenNitro: () => void;
    onRemoveRecent: (path: string) => void;
}

export function RecentProjects({ recentProjects, onOpenPath, onOpenProject, onOpenNitro, onRemoveRecent }: RecentProjectsProps) {
    // Filter to only show .rspr projects
    const rsprProjects = recentProjects.filter(path => path.endsWith('.rspr'));
    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3
        }}>
            <Paper elevation={3} sx={{
                width: '100%',
                maxWidth: 600,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 2
            }}>
                <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={logo} alt="Retrosprite" style={{ maxWidth: '80%', maxHeight: '100px', marginBottom: '16px' }} />
                    <Typography variant="subtitle1">
                        Nitro Bundle Editor & Converter
                    </Typography>
                </Box>

                <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'flex-end', borderBottom: 1, borderColor: 'divider' }}>
                    <Button
                        variant="outlined"
                        startIcon={<InsertDriveFileIcon />}
                        onClick={onOpenNitro}
                    >
                        Import Nitro
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<FolderOpenIcon />}
                        onClick={onOpenProject}
                    >
                        Open Project
                    </Button>
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                    {rsprProjects.length > 0 ? (
                        <List>
                            {rsprProjects.map((path) => (
                                <ListItem
                                    key={path}
                                    disablePadding
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="remove" onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveRecent(path);
                                        }}>
                                            <CloseIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemButton onClick={() => onOpenPath(path)}>
                                        <ListItemIcon>
                                            <AccessTimeIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={path.split(/[\\/]/).pop()}
                                            secondary={path}
                                            secondaryTypographyProps={{
                                                noWrap: true,
                                                title: path,
                                                style: { fontSize: '0.8rem' }
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography>No recent projects</Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
