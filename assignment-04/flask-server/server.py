from flask import Flask, Response, jsonify, request
import pandas as pd
import sqlite3

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route("/api/v1/get_data/<sensor>/<start>/<end>", methods=["GET"])
def main(sensor, start, end):
    print(f"Request: {sensor} {start} {end}")
    connection = sqlite3.connect("./sensors.db")
    df = pd.read_sql('''SELECT * FROM {table} 
        WHERE TIME(timestamp) BETWEEN "{start}" AND "{end}"
        GROUP BY sensor_id
        '''.format(
        table = sensor, start = start, end = end
    ), con=connection)
    connection.close()
    print(f"Response size: {df.shape}")
    return Response(
        response=df.to_json(orient="records"),
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.route("/api/v1/get-particulate-data", methods=["GET"])
def get_data():
    connection = sqlite3.connect("./derived.db")
    p_type = request.args.get('type', default = 'P1', type = str)
    start = request.args.get('start', default = '00:00:00', type = str)
    end = request.args.get('end', default = '23:59:59', type = str)

    print(f"Request particulate data: {p_type} {start} {end}")

    query = f'''SELECT cc, avg({p_type}) as P_AVG FROM sds011 WHERE TIME(timestamp) BETWEEN "{start}" AND "{end}" GROUP BY cc''';

    df = pd.read_sql(query, con=connection)
    connection.close()
    print(f"Response size: {df.shape}")
    return Response(
        response=df.to_json(orient="records"),
        headers={"Access-Control-Allow-Origin": "*"}
    )


@app.route("/api/v1/get-noise-data", methods=["GET"])
def get_noise_data():
    connection = sqlite3.connect("./derived.db")
    start = request.args.get('start', default = '00:00:00', type = str)
    end = request.args.get('end', default = '23:59:59', type = str)

    print(f"Request noise data: {start} {end}")

    query = f'''SELECT cc, avg(noise_LAeq) as noise_LAeq,min(noise_LA_min) as noise_LA_min, max(noise_LA_max) as noise_LA_max FROM laerm WHERE TIME(timestamp) BETWEEN "{start}" AND "{end}" GROUP BY cc''';

    df = pd.read_sql(query, con=connection)
    connection.close()
    print(f"Response size: {df.shape}")
    return Response(
        response=df.to_json(orient="records"),
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.route("/api/v1/get-humidity-data", methods=["GET"])
def get_humidity_data():
    connection = sqlite3.connect("./derived.db")
    start = request.args.get('start', default = '00:00:00', type = str)
    end = request.args.get('end', default = '23:59:59', type = str)

    print(f"Request noise data: {start} {end}")

    query = f'''SELECT cc, avg(humidity) as HUMIDITY_AVG FROM humidity WHERE TIME(timestamp) BETWEEN "{start}" AND "{end}" GROUP BY cc''';

    df = pd.read_sql(query, con=connection)
    connection.close()
    print(f"Response size: {df.shape}")
    return Response(
        response=df.to_json(orient="records"),
        headers={"Access-Control-Allow-Origin": "*"}
    )

app.run(port=8080)