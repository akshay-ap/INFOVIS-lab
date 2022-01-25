import React from 'react';


const temporalChartContext = React.createContext({
    selectedCountries: [],
    setSelectedCountries: () => { },
    selectedIndicator: "",
    setSelectedIndicator: () => { },
    selectedYears: [],
    setSelectedYears: () => { },
});

export default temporalChartContext;