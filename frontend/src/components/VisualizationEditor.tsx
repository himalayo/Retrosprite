import React from 'react';
import { Box, Typography, TextField, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { NitroJSON, NitroVisualization } from '../types';

interface VisualizationEditorProps {
    jsonContent: NitroJSON;
    onUpdate: (newJson: NitroJSON) => void;
}

export const VisualizationEditor: React.FC<VisualizationEditorProps> = ({ jsonContent, onUpdate }) => {
    
    const visualizations = jsonContent.visualizations || [];

    const updateViz = (index: number, field: keyof NitroVisualization, value: any) => {
        const newJson = { ...jsonContent };
        if (newJson.visualizations && newJson.visualizations[index]) {
            // @ts-ignore
            newJson.visualizations[index][field] = value;
            onUpdate(newJson);
        }
    };

    return (
        <Box sx={{ height: '100%', overflowY: 'auto', p: 3 }}>
            <Typography variant="h6" gutterBottom>Visualizations</Typography>
            
            {visualizations.length === 0 && (
                <Typography color="text.secondary">No visualizations defined.</Typography>
            )}

            {visualizations.map((viz, index) => (
                <Accordion key={index} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Visualization {index + 1} (Size: {viz.size}, Angle: {viz.angle})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                             <Box sx={{ width: '33%' }}>
                                <TextField 
                                    label="Size" type="number" size="small" fullWidth
                                    value={viz.size} 
                                    onChange={(e) => updateViz(index, 'size', parseInt(e.target.value) || 0)} 
                                />
                            </Box>
                            <Box sx={{ width: '33%' }}>
                                <TextField 
                                    label="Angle" type="number" size="small" fullWidth
                                    value={viz.angle} 
                                    onChange={(e) => updateViz(index, 'angle', parseInt(e.target.value) || 0)} 
                                />
                            </Box>
                            <Box sx={{ width: '33%' }}>
                                <TextField 
                                    label="Layer Count" type="number" size="small" fullWidth
                                    value={viz.layerCount} 
                                    onChange={(e) => updateViz(index, 'layerCount', parseInt(e.target.value) || 0)} 
                                />
                            </Box>
                        </Box>

                        <Box mt={2}>
                            <Typography variant="subtitle2">Layers Configuration:</Typography>
                            {/* Layer detailed editing could go here, for now just JSON dump or basic list */}
                             <Box sx={{ bgcolor: '#222', p: 1, borderRadius: 1, mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                 {JSON.stringify(viz.layers || {}, null, 2)}
                             </Box>
                        </Box>
                         <Box mt={2}>
                            <Typography variant="subtitle2">Animations:</Typography>
                             <Box sx={{ bgcolor: '#222', p: 1, borderRadius: 1, mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                 {Object.keys(viz.animations || {}).length} animations defined
                             </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};
