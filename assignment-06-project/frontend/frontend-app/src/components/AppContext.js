import React from 'react';


const appContext = React.createContext({
    countries: [],
    setcountries: () => { },
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
    setSelectingData: () => { },
    userSelectedCountries: [],
    setUserSelectedCountries: () => { },

});

export default appContext;