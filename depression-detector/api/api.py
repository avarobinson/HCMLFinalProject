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
import numpy 

app = Flask(__name__)
#CORS(app)

@app.route('/api/v1', methods = ['POST'])
def user_data():
    formData = request.json
    user = formData["username"]
    print(user)
    time = formData["timeframe"]
    print(time)
    tweets = []
    a = twint.Config()
    ## Uncomment out limit depending on if you want to limit the number of tweets it grabs
    ## depending on user, could go on for a really long time
    a.Username = user
    a.Pandas = True
    a.Store_object = True
    a.Store_object_tweets_list = tweets
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
    
    for i in tweets:
        all_tweets.append(i.tweet)
    print(all_tweets)

    data = [0, 1, 1, 0, 1, 1]
    percentage = numpy.mean(data) * 100
    #return all_tweets
    return {'user': str(all_tweets)}

        