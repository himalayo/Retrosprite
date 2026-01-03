import React, { useState } from 'react';
import {
    List, ListItemButton, ListItemText, Collapse,
    ListItemIcon, IconButton, Menu, MenuItem
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import retrospriteIcon from '../assets/retrosprite_icon.png';
import nitroIcon from '../assets/nitro-icon.svg';

interface FileExplorerProps {
    projects: Record<string, { path: string, files: Record<string, string> }>;
    selectedProject: string | null;
    selectedFile: string | null;
    onSelectProject: (projectName: string) => void;
    onSelectFile: (projectName: string, fileName: string) => void;
    onCloseProject: (projectName: string) => void;
    onSaveFileAs?: (projectName: string, fileName: string) => void;
    onDeleteFile?: (projectName: string, fileName: string) => void;
    onRenameFile?: (projectName: string, fileName: string) => void;
    onExportFile?: (projectName: string, fileName: string) => void;
    onRenameProject?: (projectName: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
    projects,
    selectedProject,
    selectedFile,
    onSelectProject,
    onSelectFile,
    onCloseProject,
    onSaveFileAs,
    onDeleteFile,
    onRenameFile,
    onExportFile,
    onRenameProject
}) => {
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        projectName: string;
        fileName: string;
    } | null>(null);
    const [projectContextMenu, setProjectContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        projectName: string;
    } | null>(null);

    const handleToggle = (projectName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedProjects(prev => ({
            ...prev,
            [projectName]: !prev[projectName]
        }));
        onSelectProject(projectName);
    };

    const isImageFile = (name: string) => {
        return name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');
    };

    const isNitroFile = (name: string) => {
        return name.endsWith('.nitro');
    };

    const handleContextMenu = (event: React.MouseEvent, projectName: string, fileName: string) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            projectName,
            fileName
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleProjectContextMenu = (event: React.MouseEvent, projectName: string) => {
        // Only show context menu for .rspr files
        if (!projectName.endsWith('.rspr')) return;

        event.preventDefault();
        event.stopPropagation();
        setProjectContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            projectName
        });
    };

    const handleCloseProjectContextMenu = () => {
        setProjectContextMenu(null);
    };

    const handleMenuAction = (action: 'saveAs' | 'export' | 'rename' | 'delete') => {
        if (!contextMenu) return;

        const { projectName, fileName } = contextMenu;

        switch (action) {
            case 'saveAs':
                onSaveFileAs?.(projectName, fileName);
                break;
            case 'export':
                onExportFile?.(projectName, fileName);
                break;
            case 'rename':
                onRenameFile?.(projectName, fileName);
                break;
            case 'delete':
                onDeleteFile?.(projectName, fileName);
                break;
        }

        handleCloseContextMenu();
    };

    const handleProjectMenuAction = (action: 'rename') => {
        if (!projectContextMenu) return;

        const { projectName } = projectContextMenu;

        switch (action) {
            case 'rename':
                onRenameProject?.(projectName);
                break;
        }

        handleCloseProjectContextMenu();
    };

    return (
        <List dense sx={{ overflowY: 'auto', flexGrow: 1, py: 0 }}>
            {Object.entries(projects).map(([projectName, projectData]) => {
                const isExpanded = expandedProjects[projectName];
                const isProjectSelected = selectedProject === projectName;

                return (
                    <React.Fragment key={projectName}>
                        <ListItemButton
                            onClick={(e) => handleToggle(projectName, e)}
                            onContextMenu={(e) => handleProjectContextMenu(e, projectName)}
                            selected={isProjectSelected && !selectedFile}
                            sx={{
                                py: 0.5,
                                '&:hover .close-icon': { opacity: 1 }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                {projectName.endsWith('.rspr') ? (
                                    <img src={retrospriteIcon} alt="Retrosprite" style={{ width: '1.2rem', height: '1.2rem' }} />
                                ) : projectName.endsWith('.nitro') ? (
                                    <img src={nitroIcon} alt="Nitro" style={{ width: '1.2rem', height: '1.2rem' }} />
                                ) : (
                                    <FolderIcon sx={{ color: '#ffd54f', fontSize: '1.2rem' }} />
                                )}
                            </ListItemIcon>
                            <ListItemText 
                                primary={projectName} 
                                primaryTypographyProps={{ 
                                    noWrap: true, 
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }} 
                            />
                            {isExpanded ? <ExpandLess sx={{ fontSize: '1rem', color: '#888' }} /> : <ExpandMore sx={{ fontSize: '1rem', color: '#888' }} />}
                            <IconButton
                                size="small"
                                className="close-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseProject(projectName);
                                }}
                                sx={{ 
                                    opacity: 0, 
                                    transition: 'opacity 0.2s',
                                    ml: 1,
                                    p: 0.25
                                }}
                            >
                                <CloseIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                        </ListItemButton>
                        
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {Object.keys(projectData.files).sort().map((fileName) => (
                                    <ListItemButton
                                        key={`${projectName}/${fileName}`}
                                        sx={{ pl: 4, py: 0.25 }}
                                        selected={isProjectSelected && selectedFile === fileName}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectFile(projectName, fileName);
                                        }}
                                        onContextMenu={(e) => handleContextMenu(e, projectName, fileName)}
                                    >
                                        <ListItemIcon sx={{ minWidth: 28 }}>
                                            {isNitroFile(fileName) ? (
                                                <img src={nitroIcon} alt="Nitro" style={{ width: '1rem', height: '1rem' }} />
                                            ) : (
                                                <InsertDriveFileIcon sx={{
                                                    fontSize: '1rem',
                                                    color: isImageFile(fileName) ? '#f48fb1' : (fileName.endsWith('.json') ? '#ffb74d' : '#90caf9')
                                                }} />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={fileName} 
                                            primaryTypographyProps={{ 
                                                noWrap: true, 
                                                fontSize: '0.85rem',
                                                color: (isProjectSelected && selectedFile === fileName) ? '#fff' : '#ccc'
                                            }} 
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Collapse>
                    </React.Fragment>
                );
            })}
            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={() => handleMenuAction('saveAs')}>
                    <ListItemIcon>
                        <SaveAsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Save As...</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('export')}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export File</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('rename')}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Rename</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('delete')}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            {/* Project Context Menu (for .rspr files) */}
            <Menu
                open={projectContextMenu !== null}
                onClose={handleCloseProjectContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    projectContextMenu !== null
                        ? { top: projectContextMenu.mouseY, left: projectContextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={() => handleProjectMenuAction('rename')}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Rename Project File</ListItemText>
                </MenuItem>
            </Menu>
        </List>
    );
};
