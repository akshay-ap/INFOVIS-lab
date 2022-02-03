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

const getMetadataTopics = async () => {
    var config = {
        method: 'get',
        url: host + '/data/metadata/topics',
        headers: {}
    };
    const { data } = await axios(config)
    const result = data.map(e => e.topic)
    return [...new Set(result)]
}


const getTemporalChartData = async (countries, years, indicators) => {
    var c = ["Upper middle income", "Lower middle income", "High income", "Low income"]
    var query = JSON.stringify({
        "countries": countries,
        "years": years,
        "indicators": indicators
    });

    var config = {
        method: 'post',
        url: host + '/data/query/temporal-chart',
        headers: {
            'Content-Type': 'application/json'
        },
        data: query
    };

    const { data } = await axios(config)
    return data
}



const trainModel = async (countries, years, indicators) => {
    var c = ["Upper middle income", "Lower middle income", "High income", "Low income"]
    var query = JSON.stringify({
        "countries": countries,
        "years": years,
        "indicators": indicators
    });

    var config = {
        method: 'post',
        url: host + '/model/train',
        headers: {
            'Content-Type': 'application/json'
        },
        data: query
    };

    const { data } = await axios(config)
    return data
}


export {
    getTemporalChartData,
    getMetadataCountries,
    getMetadataIndicators,
    getMetadataTopics,
    trainModel
}