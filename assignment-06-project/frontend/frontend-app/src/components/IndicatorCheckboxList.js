import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { useContext } from "react";
import AppContext from './AppContext';

export default function IndicatorCheckboxList() {

    const [checked, setChecked] = React.useState([0]);
    const { indicators } = useContext(AppContext);

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
                {indicators.map(({ indicator_name }) => {
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
                                        checked={checked.indexOf(indicator_name) !== -1}
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
