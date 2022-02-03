import './App.css';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import * as React from 'react';
import Container from '@mui/material/Container';
import TemporalChart from './components/TemporalChart';
import GeographicalChart from './components/GeographicalChart';
import AppContext from './components/AppContext';
import { useState, useEffect } from "react";
import { getMetadataCountries, getMetadataIndicators, getMetadataTopics } from './api';
import FilterSelector from './components/FilterSelector';
import { Typography } from '@mui/material';
import DecisionTreeClassifier from './components/tree/DecisionTreeClassifier';

function App() {

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [indicators, setIndicators] = useState([]);
  const [topics, setTopics] = useState(null);

  const [selectingData, setSelectingData] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(["Upper middle income", "Lower middle income", "High income", "Low income"]);
  const [selectedIndicators, setSelectedIndicators] = useState([]);

  const [years, setYears] = useState(null);


  useEffect(() => {
    (async () => {
      if (loading) {
        const data = await getMetadataCountries();
        const dataIndicators = await getMetadataIndicators();
        const dataTopics = await getMetadataTopics();

        console.log("Countries", data)
        console.log("Indicators", dataIndicators)
        console.log("Topics", dataTopics)

        setCountries(data);
        setIndicators(dataIndicators);
        setTopics(dataTopics);
        setSelectedTopics([dataTopics[0]]);
        setSelectedIndicators([dataIndicators[0]["indicator_name"],
        dataIndicators[1]["indicator_name"],
        dataIndicators[2]["indicator_name"],
        dataIndicators[3]["indicator_name"]
        ]);

        // setIndicator(data["indicators"]);
        // setYears(data["years"]);
        setLoading(false);
      }
    })()
  }, []);

  return (
    <div className="App">
      <CssBaseline />
      <AppContext.Provider value={{
        countries: countries, indicators: indicators,
        topics: topics,
        selectedTopics: selectedTopics, setSelectedTopics: setSelectedTopics,
        selectedCountries, setSelectedCountries,
        loading, setLoading, selectingData, setSelectingData, selectedIndicators, setSelectedIndicators
      }}>

        <Container>
          <Grid container spacing={2} direction="row" justifyContent="flex-start">
            {/* <Grid id="information" item md={6}>
            <Typography variant="h3">Title</Typography>
            <Typography >Text</T\ypography>
          </Grid> */}
            <Grid item md={12}>
              <div style={{ marginLeft: '10px', marginTop: '30px' }}>
                <Typography textAlign={"left"} variant='h3'>World Development Indicators</Typography>
                <Typography textAlign={"left"}>Analysis and classification of countries into 4 income groups based on selected list of indicators.
                </Typography>
              </div>
            </Grid>
            <Grid item md={12}>
              <div style={{ marginLeft: '10px' }}>
                <Typography textAlign={"left"} variant='h4'>Overview</Typography>
                <Typography textAlign={"left"}>The charts here visually are generated from the World Development Indicators dataset.
                  The dataset consists yearly values various 1443 indicators divided in 90 topics for different countries and income groups.
                  There are 4 income groups. We will analyse data from selected list of indicator from the year 2000 to 2019.
                </Typography>
              </div>
            </Grid>
            <Grid item md={12}>
              <FilterSelector />
            </Grid>
            <Grid id="temporal-charts" item md={12}>
              <TemporalChart />
            </Grid>
            <Grid id="geo-charts" item md={12}>
              <GeographicalChart />
            </Grid>
            <Grid id="tree" item md={12}>
              <DecisionTreeClassifier />
            </Grid>
          </Grid>
        </Container>
      </AppContext.Provider>
    </div>
  );
}

export default App;
