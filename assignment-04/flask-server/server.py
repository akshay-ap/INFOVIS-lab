from flask import Flask, Response, jsonify
import pandas as pd
import sqlite3

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route("/api/v1/get_data/<sensor>/<start>/<end>", methods=["GET"])
def main(sensor, start, end):
    connection = sqlite3.connect("./sensors.db")
    df = pd.read_sql('''SELECT * FROM {table} 
        WHERE TIME(timestamp) BETWEEN "{start}" AND "{end}"
        GROUP BY sensor_id
        '''.format(
        table = sensor, start = start, end = end
    ), con=connection)
    connection.close()
    return Response(
        response=df.to_json(orient="records"),
        headers={"Access-Control-Allow-Origin": "*"}
    )


app.run(port=8080)