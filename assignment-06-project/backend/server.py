from crypt import methods
import json
import sqlite3
from flask_cors import CORS
from flask import Flask, request, jsonify
import pandas as pd
app = Flask(__name__)
CORS(app)
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

@app.route('/data/metadata/countries')
def get_metadata_countries():
    conn = sqlite3.connect('data/data.db')
    df_result = pd.read_sql('''
        select Country_Code as code, Table_Name as name, Income_Group as income_group from 
        WDICountry where Income_Group is not null
        order by Income_Group asc;''', con = conn)
    conn.close()

    result = json.loads(df_result.to_json(orient= 'records'))
    return jsonify(result), 200


@app.route('/data/metadata/topics')
def get_metadata_topics():
    conn = sqlite3.connect('data/data.db')
    query = '''
    select TOPIC as topic, Indicator_Name as indicator_name from WDISERIES where topic like 'Environment%' order by topic asc;
    '''
    df_result = pd.read_sql(query, con = conn)
    conn.close()
    result = json.loads(df_result.to_json(orient= 'records'))
    return jsonify(result), 200


@app.route('/data/query/temporal-chart', methods=["POST"])
def query_data():
    data = request.get_json()
    indicators = data["indicators"]
    years = data["years"]
    countries = data["countries"]

    logger.info("Received query for %s %s %s", indicators, years, countries)
    c = "'" + "', '".join(countries) + "'"
    i = "'" + "', '".join(indicators) + "'"

    conn = sqlite3.connect('data/data.db')

    query = f'''
        select WDISeries.Topic, WDIData.*
        from WDIData 
        JOIN WDISeries ON WDIData.Indicator_Name = WDISeries.Indicator_Name
        where WDIData.Country_Name in ({c}) 
        and WDISeries.Indicator_Name in ({i})
        '''
    logger.info("*"*100)
    logger.info(query)
    logger.info("*"*100)

    df_result = pd.read_sql(query, con = conn)

    result = json.loads(df_result.to_json(orient= 'records'))
    logger.info(f"Result shape: [{df_result.shape}]")
    return jsonify(result), 200


if __name__=='__main__':
    app.run()