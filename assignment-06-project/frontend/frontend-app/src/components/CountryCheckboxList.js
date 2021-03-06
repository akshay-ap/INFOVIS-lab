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
import { Button } from '@mui/material';

export default function CountryCheckboxList() {

    const { countries, setSelectedCountries, selectedCountries } = useContext(AppContext);
    const MAX_SELECTION_LIMIT = 4;

    const handleToggle = (value) => () => {

        console.log("Selected country:", value)

        const currentIndex = selectedCountries.indexOf(value);
        const newChecked = [...selectedCountries];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedCountries(newChecked);
        console.log("Selected country:", newChecked)

    };

    const clear = () => () => {
        setSelectedCountries([]);
    };

    return (
        <div style={{ maxHeight: 500, overflow: 'auto' }}>
            {
                selectedCountries.length >= MAX_SELECTION_LIMIT ? <>
                    <Alert severity="warning">Max allowed countries {MAX_SELECTION_LIMIT}</Alert>
                    <Button variant='contained' onClick={clear()}>Clear</Button>
                </>
                    : null
            }

            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {countries.map(({ name }) => {
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
                                        checked={selectedCountries.indexOf(name) !== -1}
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
