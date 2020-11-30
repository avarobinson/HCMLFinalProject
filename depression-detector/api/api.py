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
# just for dummy data
import random

app = Flask(__name__)
# CORS(app)


@app.route('/api/v1', methods = ['POST'])
def scrape_and_predict():
    # this acts as the main function for a POST request
    formData = request.json
    # 1. scrape data 
    tweets = user_data(formData)
    # 2. clean data 
    clean_tweets = clean_and_format_data(tweets)
    # 3. run model
    predictions = predict(clean_tweets, tweets)
    return predictions


def user_data(formData):

    user = formData["username"]
    time = formData["timeframe"]
    data = []

    a = twint.Config()
    # Uncomment out limit depending on if you want to limit the number of tweets it grabs
    # depending on user, could go on for a really long time
    a.Username = user
    a.Pandas = True
    a.Store_object = True
    a.Store_object_tweets_list = data  # only uses the tweets of the current user
    a.Hide_output = True

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
        today = date.today()  # .strftime("%yr-%m-%d")
        since = today - datetime.timedelta(weeks=weeks)
        since.strftime("%yr-%m-%d")
        since = str(since)
        a.Since = since

    twint.run.Search(a)
    return data 


def clean_and_format_data(data):
    #TODO: integrate Ellie's scripts for cleaning data and prep for model

    # creates an array of tweet content only
    tweet_content = []
    for i in data:
        tweet_content.append(i.tweet)


    return data
    

def predict(modelData, originalData):
    # TODO: this is where the actual model should run 
    
    
    
    # additional data for visualizations (original tweet content & times )
    tweet_content = []
    tweet_times = []
    for i in originalData:
        tweet_content.append(i.tweet)
        tweet_times.append(i.datetime)
    
    #dummy results and percentage (will be replaced by model results)
    if len(tweet_content) != 0:
        result = np.random.choice(2, len(tweet_content), replace=True)
        result = result.tolist()
    else:
        result = []

    # turns given tweets, times, and results into a list of objects used for the data table
    resultTable = [{"tweet": t, "time": d, "risk": r}
                   for t, d, r in zip(tweet_content, tweet_times, result)]

    if len(result) != 0:
        percentage = np.mean(result) * 100
    else:
        percentage = -1

    # return all_tweets
    return jsonify({'tweets': tweet_content, 'results': result, 'percentage': percentage, 'table': resultTable})
