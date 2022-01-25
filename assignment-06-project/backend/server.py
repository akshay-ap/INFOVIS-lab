from crypt import methods
import json
from flask import Flask, request
import pandas as pd
app = Flask(__name__)
import logging

df_data = pd.read_csv("data/WDIData.csv")
df_country = pd.read_csv("data/WDICountry.csv")
df_country_series = pd.read_csv("data/WDICountry-Series.csv")
df_WDIFootNote = pd.read_csv("data/WDIFootNote.csv")
df_series = pd.read_csv("data/WDISeries.csv")
df_series_time = pd.read_csv("data/WDISeries-Time.csv")

logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.info("Completed reading data from files")

@app.route('/data/metadata')
def get_metadata():
    countries = list(df_data["Country Name"].unique())
    indicators = list(df_data["Indicator Name"].unique())
    years = list(df_data.loc[:, ~df_data.columns.isin(['Country Name','Country Code', 'Indicator Name', 'Indicator Code', 'Unnamed: 65'])])
    return {"countries": countries, "indicators": indicators, "years": years}

@app.route('/data/query/temporal-chart', methods=["POST"])
def query_data():
    data = request.get_json()
    indicator = data["indicator"]
    years = data["years"]
    countries = data["countries"]

    logger.info("Received query for [%s] [%s] [%s]", indicator, years, countries)

    rows = (df_data.loc[:, df_data.columns.isin(['Country Name', 'Indicator Name'] + years)])
    rows = rows[(rows["Country Name"].isin(countries)) & (rows["Indicator Name"] == indicator)]
    logger.info("Returning [%s] rows", rows.shape[0])
    return rows.to_json(orient="records")


if __name__=='__main__':
    app.run()