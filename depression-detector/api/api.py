import time
from flask import Flask, request, jsonify, make_response
#from flask_cors import CORS
import twint
import nest_asyncio
import sys
from datetime import date
import datetime
import pandas as pd
import json
import numpy as np

#just for dummy data
import random

app = Flask(__name__)
#CORS(app)

@app.route('/api/v1', methods = ['POST'])
def user_data():
    formData = request.json
    user = formData["username"]
    time = formData["timeframe"]
    data = []
    a = twint.Config()
    ## Uncomment out limit depending on if you want to limit the number of tweets it grabs
    ## depending on user, could go on for a really long time
    a.Username = user
    a.Pandas = True
    a.Store_object = True
    a.Store_object_tweets_list = data #only uses the tweets of the current user 
    a.Output = "none"
    
   # timeframes: past week, past month, past year, all tweets
    if time != "all time":
        if time == "past week":
            weeks = 1
        elif time == "past month":
            weeks = 4
        elif time == "past year":
            weeks = 52
        else:
            weeks = 0
        today = date.today() #.strftime("%yr-%m-%d")    
        since = today - datetime.timedelta(weeks=weeks)
        since.strftime("%yr-%m-%d")
        since = str(since)
        a.Since = since

    twint.run.Search(a)
    all_tweets = []
    
    for i in data:
        all_tweets.append(i.tweet)

    #dummy results and percentage
  
    result = np.random.choice(2, len(data), replace=True)
    result = result.tolist()

    #turns given tweets and results into a list of objects used for the data table
    resultTable = [{"tweet" : t, "risk" : r} for t, r in zip(all_tweets, result)]

    percentage = np.mean(result) * 100
    
    #return all_tweets
    return jsonify({'tweets': all_tweets, 'results': result, 'percentage': percentage, 'table': resultTable})

        