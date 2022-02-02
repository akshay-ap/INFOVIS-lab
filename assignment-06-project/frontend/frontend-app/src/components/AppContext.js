import React from 'react';


const appContext = React.createContext({
    countires: [],
    setCountires: () => { },
    indicators: [],
    setIndicators: () => { },
    topics: [],
    setTopics: () => { },
    selectedTopics: [],
    setSelectedTopics: () => { },
    selectedCountries: [],
    setSelectedCountries: () => { },
    selectedIndicators: [],
    setSelectedIndicators: () => { },
    selectedYears: [],
    setSelectedYears: () => { },
    loading: true,
    setLoading: () => { },
    selectingData: false,
    setSelectingData: () => { }
});

export default appContext;