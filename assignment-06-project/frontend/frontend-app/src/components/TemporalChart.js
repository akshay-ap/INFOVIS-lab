import { Button, Typography } from '@mui/material';
import * as React from 'react';
import { useState, useEffect } from "react";
import Paper from '@mui/material/Paper';
import { getTemporalChartData, getMetadata } from '../api';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import CheckboxList from './CheckBoxList';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    height: 700,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


const TemporalChart = () => {
    const [indicator, setIndicator] = useState("Indicator");
    const [countries, setCountries] = useState(null);
    const [years, setYears] = useState(null);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleApply = () => {

    }

    useEffect(() => {
        (async () => {
            if (loading) {
                const data = await getMetadata();
                console.log("Metadata", data)
                setCountries(data["countries"]);
                setIndicator(data["indicators"]);
                setYears(data["years"]);
                setLoading(false);
            }
        })()
    }, []);

    return (<Paper>
        <div>
            Temporal chart
            <Button variant='contained' onClick={handleOpen}>Filter</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Select filter parameters
                    </Typography>
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Indicator" {...a11yProps(0)} />
                                <Tab label="Countries" {...a11yProps(1)} />
                                <Tab label="Year" {...a11yProps(2)} />
                            </Tabs>
                        </Box>
                        <TabPanel value={value} index={0}>
                            <CheckboxList data={indicator} />
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <CheckboxList data={countries} />
                        </TabPanel>
                        <TabPanel value={value} index={2}>
                            <CheckboxList data={years} />
                        </TabPanel>
                    </Box>
                    <Button variant='contained' onClick={handleApply}>Apply</Button>
                </Paper>
            </Modal>
        </div>

    </Paper>)
}

export default TemporalChart;