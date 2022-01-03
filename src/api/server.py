from flask import Flask
from flask_restful import Api
import pandas as pd
import ast
from stats import *

app = Flask(__name__)
api = Api(app)

api.add_resource(stats, '/api/stats')