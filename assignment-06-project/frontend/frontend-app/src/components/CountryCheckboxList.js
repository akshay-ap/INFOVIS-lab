import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { useContext } from "react";
import AppContext from './AppContext';

export default function CountryCheckboxList() {

    const [checked, setChecked] = React.useState([0]);
    const { countries } = useContext(AppContext);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    return (
        <div style={{ maxHeight: 500, overflow: 'auto' }}>
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
                                        checked={checked.indexOf(name) !== -1}
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
