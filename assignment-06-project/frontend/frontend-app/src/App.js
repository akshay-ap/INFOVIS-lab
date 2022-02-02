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

        <Container maxWidth="l">
          <Grid container spacing={2} direction="row" justifyContent="flex-start">
            {/* <Grid id="information" item md={6}>
            <Typography variant="h3">Title</Typography>
            <Typography >Text</T\ypography>
          </Grid> */}
            <Grid item md={12}>
              {selectedIndicators.map(i => {
                <><Typography>{i}</Typography></>
              })}
            </Grid>
            <Grid item md={12}>
              <FilterSelector />
            </Grid>
            <Grid id="temporal-charts" item md={12}>
              <TemporalChart />
            </Grid>
            {/* <Grid id="geogprahical-mal" item md={12}>
            <GeographicalChart />
          </Grid> */}
          </Grid>
        </Container>
      </AppContext.Provider>
    </div>
  );
}

export default App;
