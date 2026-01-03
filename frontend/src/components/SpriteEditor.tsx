import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import type { NitroJSON, NitroFrame } from '../types';

interface SpriteEditorProps {
    jsonContent: NitroJSON;
    imageContent: string | null; // Base64 of the image
    onUpdate: (newJson: NitroJSON) => void;
}

export const SpriteEditor: React.FC<SpriteEditorProps> = ({ jsonContent, imageContent, onUpdate }) => {
    const [selectedFrameKey, setSelectedFrameKey] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // If no spritesheet data, render nothing or warning
    if (!jsonContent.spritesheet) {
        return <Box p={2}>No spritesheet data found in this JSON.</Box>;
    }

    const { frames } = jsonContent.spritesheet;

    // Center image on mount or when image changes
    useEffect(() => {
        if (containerRef.current && imageRef.current) {
            setPan({ x: 0, y: 0 });
        }
    }, [imageContent]);

    // Handle Wheel via ref for non-passive listener to prevent browser zoom
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setScale(s => Math.max(0.1, Math.min(10, s + delta)));
            } else {
                // Optional: Prevent swipe navigation on trackpads if needed, but for now just pan
                setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
            }
        };

        container.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', onWheel);
        };
    }, []);

    const handleFrameClick = (key: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFrameKey(key);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isPanning.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        setSelectedFrameKey(null); // Deselect on background click
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning.current) return;

        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isPanning.current = false;
    };

    const handleMouseLeave = () => {
        isPanning.current = false;
    };

    const resetView = () => {
        setPan({ x: 0, y: 0 });
        setScale(1);
    };

    const updateFrame = (field: keyof NitroFrame['frame'], value: number) => {
        if (!selectedFrameKey || !jsonContent.spritesheet) return;

        const newJson = { ...jsonContent };
        const frameData = newJson.spritesheet!.frames[selectedFrameKey];

        if (frameData) {
            frameData.frame[field] = value;
            onUpdate(newJson);
        }
    };

    const selectedFrameData = selectedFrameKey ? frames[selectedFrameKey] : null;

    return (
        <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Visual Area */}
            <Box
                ref={containerRef}
                sx={{
                    flexGrow: 1,
                    bgcolor: '#333',
                    position: 'relative',
                    overflow: 'hidden', // Changed from auto to hidden for manual panning
                    cursor: isPanning.current ? 'grabbing' : 'grab',
                    // Checkerboard background
                    backgroundImage: 'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    backgroundColor: '#333'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {imageContent ? (
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
                        transformOrigin: 'center',
                        transition: isPanning.current ? 'none' : 'transform 0.1s ease-out'
                    }}>
                        <img
                            ref={imageRef}
                            src={`data:image/png;base64,${imageContent}`}
                            alt="Spritesheet"
                            style={{ display: 'block', pointerEvents: 'none' }} // Disable pointer events on img so dragging works smoothly
                            draggable={false}
                        />
                        {/* Overlay Boxes */}
                        {Object.entries(frames).map(([key, data]) => (
                            <div
                                key={key}
                                onClick={(e) => handleFrameClick(key, e)}
                                title={key}
                                style={{
                                    position: 'absolute',
                                    left: data.frame.x,
                                    top: data.frame.y,
                                    width: data.frame.w,
                                    height: data.frame.h,
                                    border: selectedFrameKey === key ? '2px solid #00ff00' : '1px solid rgba(255, 255, 255, 0.5)',
                                    backgroundColor: selectedFrameKey === key ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="error">Image file not found in bundle.</Typography>
                    </Box>
                )}

                {/* Reset View Button Overlay */}
                <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<CenterFocusStrongIcon />}
                        onClick={resetView}
                        sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                    >
                        Reset View
                    </Button>
                </Box>
            </Box>

            {/* Sidebar / Properties Panel */}
            <Paper sx={{ width: 300, p: 2, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #555', zIndex: 10 }}>
                <Typography variant="h6" gutterBottom>Sprite Inspector</Typography>

                <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
                    <Typography>Zoom: {Math.round(scale * 100)}%</Typography>
                    <Box>
                        <Button size="small" onClick={() => setScale(s => Math.max(0.1, s - 0.1))} sx={{ minWidth: 30 }}>-</Button>
                        <Button size="small" onClick={() => setScale(1)} sx={{ minWidth: 40 }}>1:1</Button>
                        <Button size="small" onClick={() => setScale(s => Math.min(10, s + 0.1))} sx={{ minWidth: 30 }}>+</Button>
                    </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" paragraph>
                    Hold Ctrl + Scroll to zoom. Drag to pan.
                </Typography>

                {selectedFrameData ? (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, wordBreak: 'break-all', fontSize: '0.8rem', bgcolor: 'rgba(255,255,255,0.05)', p: 1, borderRadius: 1 }}>
                            {selectedFrameKey}
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ width: '45%' }}>
                                <TextField
                                    label="X" type="number" size="small" fullWidth
                                    value={selectedFrameData.frame.x}
                                    onChange={(e) => updateFrame('x', parseInt(e.target.value) || 0)}
                                />
                            </Box>
                            <Box sx={{ width: '45%' }}>
                                <TextField
                                    label="Y" type="number" size="small" fullWidth
                                    value={selectedFrameData.frame.y}
                                    onChange={(e) => updateFrame('y', parseInt(e.target.value) || 0)}
                                />
                            </Box>
                            <Box sx={{ width: '45%' }}>
                                <TextField
                                    label="W" type="number" size="small" fullWidth
                                    value={selectedFrameData.frame.w}
                                    onChange={(e) => updateFrame('w', parseInt(e.target.value) || 0)}
                                />
                            </Box>
                            <Box sx={{ width: '45%' }}>
                                <TextField
                                    label="H" type="number" size="small" fullWidth
                                    value={selectedFrameData.frame.h}
                                    onChange={(e) => updateFrame('h', parseInt(e.target.value) || 0)}
                                />
                            </Box>
                        </Box>

                        <Box mt={2}>
                            <Typography variant="caption" color="text.secondary">
                                Adjusting these values updates the JSON definition.
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Typography color="text.secondary">Select a sprite region to edit.</Typography>
                )}
            </Paper>
        </Box>
    );
};
