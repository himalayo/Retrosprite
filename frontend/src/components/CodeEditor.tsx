import React, { useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    onSave?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, onSave }) => {

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Ctrl+S to save (CodeMirror catches some keys, but we wrapper catches bubbling events)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            e.stopPropagation();
            onSave && onSave();
        }
    }, [onSave]);

    return (
        <Box
            onKeyDown={handleKeyDown}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#1e1e1e',
            }}
        >
            {/* Toolbar */}
            <Box sx={{
                p: 0.5,
                borderBottom: '1px solid #333',
                bgcolor: '#252526',
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                {onSave && (
                    <Button
                        startIcon={<SaveIcon />}
                        size="small"
                        onClick={onSave}
                        variant="contained"
                        sx={{ textTransform: 'none', height: 28 }}
                        color="primary"
                    >
                        Save
                    </Button>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Ctrl+F for Search/Replace
                </Typography>
            </Box>

            {/* CodeMirror Instance */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }} onKeyDown={handleKeyDown}>
                <CodeMirror
                    value={value}
                    height="100%"
                    theme={vscodeDark}
                    extensions={[
                        json(),
                        EditorView.lineWrapping
                    ]}
                    onChange={(val) => {
                        onChange(val);
                    }}
                    style={{ height: '100%', fontSize: '13px' }}
                />
            </Box>
        </Box>
    );
};
