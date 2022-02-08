import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { useContext, useState } from "react";
import AppContext from './AppContext';
import Alert from '@mui/material/Alert';
import { Button, Typography } from '@mui/material';

export default function IndicatorCheckboxList() {

    const MAX_SELECTION_LIMIT = 10;

    const { indicators, selectedTopics, selectedIndicators, setSelectedIndicators } = useContext(AppContext);
    const filtertedIndicators = indicators.filter(e => selectedTopics.includes(e.topic));

    const handleToggle = (value) => () => {
        const currentIndex = selectedIndicators.indexOf(value);
        const newChecked = [...selectedIndicators];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedIndicators(newChecked);
    };

    const clear = () => () => {
        setSelectedIndicators([]);
    };

    return (
        <div style={{ maxHeight: 500, overflow: 'auto' }}>
            {
                selectedIndicators.length >= MAX_SELECTION_LIMIT ? <>
                    <Alert severity="warning">More than {MAX_SELECTION_LIMIT} indicators selected</Alert>
                    <Button variant='contained' onClick={clear()}>Clear</Button>
                </>
                    : <>
                        <Typography>{selectedIndicators.length} indicators selected</Typography>
                        <Button variant='contained' onClick={clear()}>Clear</Button>
                    </>
            }
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {filtertedIndicators.map(({ indicator_name }) => {
                    const labelId = `checkbox-list-label-${indicator_name}`;

                    return (
                        <ListItem
                            key={indicator_name}
                            disablePadding
                        >
                            <ListItemButton role={undefined} onClick={handleToggle(indicator_name)} dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={selectedIndicators.indexOf(indicator_name) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={`${indicator_name}`} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}
