import { useState } from "react";
import { encodeContent, getFileNameFromPath, isTextFile } from "../utils/file_utils";
import type { RsprProject } from "../types";

export interface ProjectData {
    path: string;
    files: Record<string, string>;
    settings?: {
        lastOpenedFile?: string;
    };
}
export const useProject = () => {
    const [projects, setProjects] = useState<Record<string, ProjectData>>({});
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const onOpenFile = (result: any) => {
        const projectName = getFileNameFromPath(result.path);
        setProjects(prev => ({
            ...prev,
            [projectName]: {
                path: result.path,
                files: result.files as any
            }
        }));
        // Auto select the new project
        setSelectedProject(projectName);
    }

    const renameFile = async (projectName: string, fileName: string, newFileName: string, onSuccess: () => void, onError: () => void, onDone: () => void) => {
        try {
            const project = projects[projectName];
            if (!project) return;

            const fileContent = project.files[fileName];
            if (!fileContent) return;

            // Update project with renamed file
            setProjects(prev => ({
                ...prev,
                [projectName]: {
                    ...prev[projectName],
                    files: {
                        ...prev[projectName].files,
                        [newFileName]: fileContent
                    }
                }
            }));

            // Remove old file
            setProjects(prev => {
                const updatedFiles = { ...prev[projectName].files };
                delete updatedFiles[fileName];
                return {
                    ...prev,
                    [projectName]: {
                        ...prev[projectName],
                        files: updatedFiles
                    }
                };
            });


            onSuccess();
        } catch (err) {
            onError();
        } finally {
            onDone();
        }
    };

    
    const renameProject = async (projectToRename: string, newName: string, onNotFound: () => void, onInvalidResponse: () => void, onSuccess: (result: any, project: ProjectData) => void, onError: (err: unknown) => void) => {
        try {
            const project = projects[projectToRename];
            if (!project) {
                onNotFound();
                return;
            }

            // @ts-ignore - renameFurnitureData=false to only rename the project file, not the furniture data
            const result = await RenameNitroProject(project.path, newName, '', false);

            if (!result || !result.files) {
                onInvalidResponse();
                return;
            }

            const newProjectName = getFileNameFromPath(result.path);

            setProjects(prev => {
                const next = { ...prev };
                delete next[projectToRename];
                next[newProjectName] = {
                    path: result.path,
                    files: result.files as any
                };
                return next;
            });

            setSelectedProject(newProjectName);
            onSuccess(result, project);
        } catch (err) {
            onError(err);
        }
    };

    const onJsonUpdate = (updates: Record<string, string>) => {
        if (!selectedProject) return;
        setProjects(prev => ({
            ...prev,
            [selectedProject]: {
                ...prev[selectedProject],
                files: {
                    ...prev[selectedProject].files,
                    ...updates
                }
            }
        }));
    }

    const onFileSelect = (projectName: string, selectedFile: string | null, fileContent: string) => {
        // If switching from another text file where we have pending edits in 'fileContent', 
        // strictly speaking we should probably save them to the project state first.
        // For now, let's just update the previous file in the project state before switching.
        if (selectedProject && selectedFile && isTextFile(selectedFile)) {
            setProjects(prev => {
                const currentProj = prev[selectedProject];
                if (!currentProj) return prev;
                return {
                    ...prev,
                    [selectedProject]: {
                        ...currentProj,
                        files: {
                            ...currentProj.files,
                            [selectedFile]: encodeContent(fileContent)
                        }
                    }
                };
            });
        }

        setSelectedProject(projectName);
    }

    const closeProject = (projectName: string) => {
        setProjects(prev => {
            const next = { ...prev };
            delete next[projectName];
            return next;
        });
        if (selectedProject === projectName) {
            setSelectedProject(null);
        }
    }

    const updateSelectedProject = (files: {[x: string]: string}) => {
        if (!selectedProject) return;
        setProjects(prev => ({
            ...prev,
            [selectedProject]: {
                ...prev[selectedProject],
                files: files
            }
        }));
    }

    const onSaveAs = (savedPath: any, newProjectName: string, filesToSave: {[x: string]: string}, rsprData: RsprProject) => {
        if (!selectedProject) return;

        // Update state with new path/name
        setProjects(prev => {
            const next = { ...prev };
            // If name changed, delete old key
            if (newProjectName !== selectedProject) {
                delete next[selectedProject];
            }
            next[newProjectName] = {
                path: savedPath,
                files: filesToSave,
                settings: rsprData.settings
            };
            return next;
        });
        
        setSelectedProject(newProjectName);
    }

    const onConfirmRenameFile = (projectName: string, fileName: string, newFileName: string, onSuccess: () => void, onError: (err: unknown) => void, onDone: () => void) => {
        try {
            const project = projects[projectName];
            if (!project) return;

            const fileContent = project.files[fileName];
            if (!fileContent) return;

            // Update project with renamed file
            setProjects(prev => ({
                ...prev,
                [projectName]: {
                    ...prev[projectName],
                    files: {
                        ...prev[projectName].files,
                        [newFileName]: fileContent
                    }
                }
            }));

            // Remove old file
            setProjects(prev => {
                const updatedFiles = { ...prev[projectName].files };
                delete updatedFiles[fileName];
                return {
                    ...prev,
                    [projectName]: {
                        ...prev[projectName],
                        files: updatedFiles
                    }
                };
            });
            onSuccess();
        } catch (err) {
            onError(err);
        } finally {
            onDone();
        }
    }

    const onConfirmDeleteFile = (projectName: string, fileName: string, onSuccess: () => void, onError: (err: unknown) => void, onDone: () => void) => {
        try {
            // Remove file from project
            setProjects(prev => {
                const updatedFiles = { ...prev[projectName].files };
                delete updatedFiles[fileName];
                return {
                    ...prev,
                    [projectName]: {
                        ...prev[projectName],
                        files: updatedFiles
                    }
                };
            });
            onSuccess();
        } catch (err) {
            onError(err);
        } finally {
            onDone();
        }
    }

    const selectProject = (projectName: string) => {
        setSelectedProject(projectName);
    }

    const onRenameNitroFile = (result: any, pathChanged: boolean) => {
        if (!selectedProject) return;
        const newProjectName = getFileNameFromPath(result.path);
        setProjects(prev => {
            const next = { ...prev };
            if (pathChanged) {
                // File was renamed (.nitro files)
                delete next[selectedProject];
                next[newProjectName] = {
                    path: result.path,
                    files: result.files as any
                };
            } else {
                // Just update the files in place (.rspr files)
                next[selectedProject] = {
                    ...next[selectedProject],
                    files: result.files as any
                };
            }
            return next;
        });

        if (pathChanged) {
            setSelectedProject(newProjectName);
        }
    }


    return {projects, selectedProject, selectProject, onOpenFile, renameFile, renameProject, onJsonUpdate, onFileSelect, closeProject, updateSelectedProject, onSaveAs, onConfirmRenameFile, onConfirmDeleteFile, onRenameNitroFile};
}