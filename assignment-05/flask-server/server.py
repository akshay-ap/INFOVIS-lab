from flask import Flask, Response, jsonify
import pandas as pd
import sqlite3

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route("/api/v1/get_data/", methods=["GET"])
def main():
    return Response(None)

app.run(port=8080)
