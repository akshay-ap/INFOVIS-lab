from flask import Flask, Response, jsonify
import pandas as pd
import sqlite3
import json

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route("/api/v1/get-data/authorkeywords-year", methods=["GET"])
def authorkeywords_year_data():
    with open('authorKeywords-year.json') as f:
        data = json.load(f)
        return jsonify(data)

@app.route("/api/v1/get-data/abstract-conference", methods=["GET"])
def data():
    with open('abstract-conference.json') as f:
        data = json.load(f)
        return jsonify(data)

app.run(port=8080)

