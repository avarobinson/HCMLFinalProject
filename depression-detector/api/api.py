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

app = Flask(__name__)
#CORS(app)

@app.route('/api/v1', methods = ['POST'])
def get_current_time():
    formData = request.json
    user = formData["username"]
    time = formData["timeframe"]
    a = twint.Config()
    ## Uncomment out limit depending on if you want to limit the number of tweets it grabs
    ## depending on user, could go on for a really long time
    a.Username = user
    a.Pandas = True
    a.Store_object = True
    a.Output = "none"
    
   # timeframes: past week, past month, past year, all tweets
    if time != "alltime":
        if time == "pastweek":
            weeks = 1
        elif time == "pastmonth":
            weeks = 4
        elif time == "pastyear":
            weeks = 52
        else:
            weeks = 0
        today = date.today() #.strftime("%yr-%m-%d")    
        since = today - datetime.timedelta(weeks=weeks)
        since.strftime("%yr-%m-%d")
        since = str(since)
        a.Since = since
    
    twint.run.Search(a)
    tweets_as_objects = twint.output.tweets_list
    all_tweets = []
    for i in tweets_as_objects:
        all_tweets.append(i.tweet)
    #return all_tweets
    return {'user': str(all_tweets)}
        