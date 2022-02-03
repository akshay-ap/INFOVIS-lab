import React, { useContext, useEffect, useState } from 'react';
import { FormControl, InputLabel, Input, FormHelperText, Button, Typography } from '@mui/material';
import { trainModel } from '../../api';
import AppContext from '../AppContext';
import ShowTree from './ShowTree';

const DecisionTreeClassifier = () => {

    const [loading, setLoading] = useState(false);
    const [valid, setValid] = useState(false);
    const [result, setResult] = useState(null);

    const { selectedIndicators } = useContext(AppContext);

    const submit = async () => {
        setLoading(true);
        console.log("Clicked train model");
        const result = await trainModel([], [], selectedIndicators);
        console.log("Model accuracy", result);
        setResult(result)
        setLoading(false);
    }

    useEffect(() => {
        if (valid && !result) {
            submit();
        }
    }, [valid])

    useEffect(() => {
        if (selectedIndicators.length >= 4) {
            setValid(true);
        }
    }, [selectedIndicators])

    return (<div>
        <hr />
        <div style={{ marginLeft: '10px' }}>
            <Typography textAlign={"left"} variant='h4'>Decision tree classifier</Typography>
            <Typography textAlign={"left"}>Select the parameters for training the decision tree. The algorithm will use only the selected indicators from the filter.
                If there are any empty values, they will be replaced with the mean value for that indicator.</Typography>
        </div>

        {
            !loading ? <FormControl>
                <InputLabel htmlFor="my-input">Email address</InputLabel>
                <Input id="min_samples_leaf" aria-describedby="my-helper-text" />
                <FormHelperText id="my-helper-text">We'll never share your email.</FormHelperText>
                <Button variant='contained' disabled={!valid} onClick={submit}>Train</Button>
            </FormControl> : <>Training</>
        }
        {
            result ? <div>
                <Typography textAlign={"left"} variant='h5'>Result</Typography>
                <Typography textAlign={"left"}>Accuracy: {((result['accuracy'] * 100).toFixed(2))}&#37;</Typography>
                <ShowTree data={result['tree_rules']} />
            </div> : null
        }

    </div>
    )

}

export default DecisionTreeClassifier;