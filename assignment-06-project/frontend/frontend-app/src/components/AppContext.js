import React from 'react';


const appContext = React.createContext({
    countires: [],
    setCountires: () => { },
    indicators: [],
    setIndicators: () => { },
    selectedCountries: [],
    setSelectedCountries: () => { },
    selectedIndicator: "",
    setSelectedIndicator: () => { },
    selectedYears: [],
    setSelectedYears: () => { },
});

export default appContext;