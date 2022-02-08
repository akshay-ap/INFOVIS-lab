import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { useContext, useState } from "react";
import AppContext from './AppContext';
import { Button, Typography } from '@mui/material';

export default function TopicCheckboxList() {

    const { topics, selectedTopics, setSelectedTopics } = useContext(AppContext);
    const MAX_SELECTION_LIMIT = 1;

    const handleToggle = (value) => () => {

        console.log("Selected country:", value)

        const currentIndex = selectedTopics.indexOf(value);
        const newChecked = [...selectedTopics];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedTopics(newChecked);
        console.log("Selected topics:", newChecked)

    };

    const clear = () => () => {
        setSelectedTopics([]);
    };

    return (
        <div style={{ maxHeight: 500, overflow: 'auto' }}>


            <Typography>{selectedTopics.length} topic selected</Typography>
            <Button variant='contained' onClick={clear()}>Clear</Button>

            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {topics.map((name) => {
                    const labelId = `checkbox-list-label-${name}`;

                    return (
                        <ListItem
                            key={name}
                            disablePadding
                        >
                            <ListItemButton role={undefined} onClick={handleToggle(name)} dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={selectedTopics.indexOf(name) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={`${name}`} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}
