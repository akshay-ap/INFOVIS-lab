import axios from 'axios';

const host = 'http://localhost:5000'
const getMetadataCountries = async () => {
    var config = {
        method: 'get',
        url: host + '/data/metadata/countries',
        headers: {}
    };

    const { data } = await axios(config)
    return data

}


const getMetadataIndicators = async () => {
    var config = {
        method: 'get',
        url: host + '/data/metadata/topics',
        headers: {}
    };

    const { data } = await axios(config)
    return data
}


const getTemporalChartData = async (countries, years, indicator) => {
    var data = JSON.stringify({
        "countries": countries,
        "years": years,
        "indicator": indicator
    });

    var config = {
        method: 'post',
        url: host + '/data/query/temporal-chart',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    const result = await axios(config)
    return result
}

export {
    getTemporalChartData,
    getMetadataCountries,
    getMetadataIndicators
}