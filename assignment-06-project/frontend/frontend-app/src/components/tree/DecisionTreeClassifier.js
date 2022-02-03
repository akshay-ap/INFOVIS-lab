import React, { useContext, useEffect, useState } from 'react';
import { FormControl, Select, MenuItem, Slider, FormControlLabel, TextField, FormLabel, RadioGroup, Radio, InputLabel, Input, FormHelperText, Button, Typography, Grid } from '@mui/material';
import { trainModel } from '../../api';
import AppContext from '../AppContext';
import ShowTree from './ShowTree';
import CircularProgress from '@mui/material/CircularProgress';

const DecisionTreeClassifier = () => {

    const [loading, setLoading] = useState(false);
    const [valid, setValid] = useState(false);
    const [result, setResult] = useState(null);

    const { selectedIndicators } = useContext(AppContext);

    const defaultValues = {
        criterion: "gini",
        max_depth: 4,
        min_samples_leaf: 5,
        random_state: 42
    };

    const [formValues, setFormValues] = useState(defaultValues)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const submit = async () => {
        setLoading(true);
        formValues["max_depth"] = parseInt(formValues["max_depth"])
        formValues["min_samples_leaf"] = parseInt(formValues["min_samples_leaf"])
        formValues["random_state"] = parseInt(formValues["random_state"])
        console.log("Clicked train model", formValues);

        const result = await trainModel([], [], selectedIndicators, formValues);
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
                <Grid container spacing={2}>
                    <Grid item md={6}>
                        <TextField
                            id="max-depth-input"
                            name="max_depth"
                            label="max_depth"
                            type="number"
                            value={formValues.max_depth}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            id="min-samples-leaf-input"
                            name="min_samples_leaf"
                            label="min_samples_leaf"
                            type="number"
                            value={formValues.min_samples_leaf}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            id="random_state-input"
                            name="random_state"
                            label="random_state"
                            type="number"
                            value={formValues.random_state}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item md={6}><FormLabel>Criterion</FormLabel>
                        <RadioGroup
                            name="criterion"
                            value={formValues.criterion}
                            onChange={handleInputChange}
                            row
                        >
                            <FormControlLabel
                                key="gini"
                                value="gini"
                                control={<Radio size="small" />}
                                label="gini"
                            />
                            <FormControlLabel
                                key="entropy"
                                value="entropy"
                                control={<Radio size="small" />}
                                label="entropy"
                            />
                        </RadioGroup>
                    </Grid>
                </Grid>
                <Grid item md={12}>
                    <Button variant='contained' disabled={!valid} onClick={submit}>Train</Button>
                </Grid>
            </FormControl> : <><CircularProgress /></>
        }
        {
            result ? <div>
                <Typography textAlign={"left"} variant='h5'>Result</Typography>
                <Typography textAlign={"left"}>Accuracy: {((result['accuracy'] * 100).toFixed(2))}&#37;</Typography>
                <ShowTree data={result['tree_rules']} indicators={selectedIndicators} />
            </div> : null
        }

    </div>
    )

}

export default DecisionTreeClassifier;