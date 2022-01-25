import React from 'react';


const temporalChartContext = React.createContext({
    countries: null,
    login: () => { },
    logout: () => { },
});
export default temporalChartContext;