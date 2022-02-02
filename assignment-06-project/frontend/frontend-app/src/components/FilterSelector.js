import * as React from 'react';
import { useContext, useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Modal from '@mui/material/Modal';
import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import CountryCheckboxList from './CountryCheckboxList';
import IndicatorCheckboxList from './IndicatorCheckboxList';
import TopicCheckboxList from './TopicCheckboxList';
import AppContext from './AppContext';

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

const FilterSelector = () => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setSelectingData(true);
        setOpen(true)
    };
    const handleClose = () => setOpen(false);
    const { setSelectingData } = useContext(AppContext);

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setSelectingData(true);
        setValue(newValue);
    };


    const handleApply = (event) => {
        setSelectingData(false);
        console.log("update ui")
        handleClose();
    };
    return (
        <div>
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
                                <Tab label="Topics" {...a11yProps(0)} />
                                <Tab label="Indicator" {...a11yProps(0)} />
                                {/* <Tab label="Countries" {...a11yProps(1)} /> */}
                                {/* <Tab label="Year" {...a11yProps(2)} /> */}
                            </Tabs>
                        </Box>
                        <TabPanel value={value} index={0}>
                            <TopicCheckboxList />
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <IndicatorCheckboxList />
                        </TabPanel>
                        {/* <TabPanel value={value} index={2}>
                            <CountryCheckboxList />
                        </TabPanel> */}
                        {/* <TabPanel value={value} index={2}>
                            <CheckboxList data={years} />
                        </TabPanel> */}
                    </Box>
                    <Button variant='contained' onClick={handleApply}>Apply</Button>
                </Paper>
            </Modal>
        </div>
    )
}

export default FilterSelector;