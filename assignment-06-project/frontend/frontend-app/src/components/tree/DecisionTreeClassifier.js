import React from 'react';
import { FormControl, InputLabel, Input, FormHelperText, Button, Typography } from '@mui/material';

const DecisionTreeClassifier = () => {

    const submit = () => {

    }

    return (<div>
        <div style={{ marginLeft: '10px' }}>
            <Typography textAlign={"left"} variant='h4'>Decision tree classifier</Typography>
            <Typography textAlign={"left"}>Select the parameters for training the decision tree. The algorithm will use only the selected indicators from the filter.
                If there are any empty values, they will be replaced with the mean value for that indicator.</Typography>
        </div>
        <FormControl>
            <InputLabel htmlFor="my-input">Email address</InputLabel>
            <Input id="my-input" aria-describedby="my-helper-text" />
            <FormHelperText id="my-helper-text">We'll never share your email.</FormHelperText>
            <Button variant='contained' onClick={submit()}>Train</Button>
        </FormControl>
    </div>
    )

}

export default DecisionTreeClassifier;