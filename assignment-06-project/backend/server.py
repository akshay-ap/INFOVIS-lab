from crypt import methods
import json
import sqlite3
from flask_cors import CORS
from flask import Flask, request, jsonify
import pandas as pd
from tree_rules import rules
import traceback

app = Flask(__name__)
CORS(app)
import logging

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score,classification_report,confusion_matrix

year_min = 2000
year_max = 2019

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
    # query = '''
    # select TOPIC as topic, Indicator_Name as indicator_name from WDISERIES where topic like 'Environment%' order by topic asc;
    # '''

    query = '''
    select TOPIC as topic, Indicator_Name as indicator_name from WDISERIES where CAN_BE_USED == True order by topic asc;
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


@app.route('/model/train', methods=["POST"])
def train_model():
    try:
        data = request.get_json()

        logger.info("Body %s", data)

        indicators = data["indicators"]
        years = data["years"]
        countries = data["countries"]
        parameters = data.get("parameters",{
            'criterion': "gini",
            'max_depth': 4,
            'min_samples_leaf': 5,
            'random_stateint': 42
        })

        logger.info("Received model train request for %s %s %s", indicators, years, countries)

        c = "'" + "', '".join(countries) + "'"
        i = "'" + "', '".join(indicators) + "'"


        query = f'''
        select WDISeries.Topic, WDICountry.Income_Group, WDIData.*
            from WDIData 
            JOIN WDISeries ON WDIData.Indicator_Name = WDISeries.Indicator_Name
            JOIN WDICountry ON WDICountry.Country_Code = WDIData.Country_Code
            where 
            WDISeries.Indicator_Name in ({i})
            --WDIData.Country_Name in ('Afghanistan', 'Canada', 'Ecuador', 'Germany') 
            and WDICountry.Income_Group is not NULL;
            '''
        
        logger.info("*"*100)
        logger.info(query)
        logger.info("*"*100)
        conn = sqlite3.connect('data/data.db')

        df_data_cluster = pd.read_sql(query, con = conn)
        non_year_cols = ["Country_Name", "Country_Code", "Income_Group", "Indicator_Name", "Topic", "Indicator_Code"]
        dd = df_data_cluster.melt(id_vars= non_year_cols, 
                var_name="Year", 
                value_name="Value")

        logger.info(f"Dataset size before filtering: {dd.shape}")
        logger.info(f"Count of empty values in the dataset: {dd.isnull().sum().sum()}")

        years = [str(i) for i in range(year_min, year_max +1)]
        dd = dd[dd['Year'].isin(years)]

        logger.info(f"Dataset size after filtering: {dd.shape}")
        result = dd.groupby(non_year_cols)["Value"].mean().round(2).reset_index()[["Indicator_Name","Country_Name", "Income_Group", "Value"]]
        result = result.groupby(['Country_Name' ,'Income_Group','Indicator_Name'])['Value'].first().unstack().reset_index()
        logger.info(result.shape)

        result.drop('Country_Name', axis=1, inplace=True)

        logger.info(df_data_cluster.shape)

        result.fillna(result.mean(), inplace=True)
        X = result.drop('Income_Group',axis=1)
        y = result[['Income_Group']]

        target_names = list(result['Income_Group'].unique())
        feature_names = list(X.columns)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.3,random_state=42)

        criterion = parameters.get('criterion', "gini")
        random_state = int(parameters.get('random_state', 42))
        max_depth = int(parameters.get('max_depth', 5))
        min_samples_leaf = int(parameters.get('min_samples_leaf', 5))

        logger.info("Model parameters criterion=%s random_state=%s max_depth=%s min_samples_leaf=%s", criterion, random_state, max_depth, min_samples_leaf)


        clf_model = DecisionTreeClassifier(criterion=criterion, random_state=random_state, max_depth=max_depth, min_samples_leaf=min_samples_leaf)   
        clf_model.fit(X_train,y_train)
        y_predict = clf_model.predict(X_test)
        accuracy = accuracy_score(y_test,y_predict)

        tree_rules = rules(clf_model,feature_names, target_names)

        return jsonify({'accuracy': accuracy, 'tree_rules': tree_rules}), 200
    except Exception as err:
        
        traceback.print_tb(err.__traceback__)
        return jsonify({'status': 'failed', 'error': str(err)}), 400


if __name__=='__main__':
    app.run()