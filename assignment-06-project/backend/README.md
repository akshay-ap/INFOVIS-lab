# Environment

- Linux OS (Mint)
- Python 3.8.10

# Setup

- Create virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install Flask flask-cors pandas sklearn notebook
```

- Start and run jupyter notebook

```bash
jupyter notebook
```
    - Open jupyter UI in browser
    - Open notebook `Data preprocessing.ipynb`
    - Run all cells

The jupyter nodebook will download the zip file from the data source, process the data, and prepare an sqlite database.

- Start server

```bash
python3 server.py
```