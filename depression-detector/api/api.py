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
from transformers import RobertaTokenizer, RobertaForSequenceClassification
import torch

app = Flask(__name__)
# CORS(app)


@app.route('/api/v1', methods = ['POST'])
def scrape_and_predict():
    # this acts as the main function for a POST request
    formData = request.json
    # 1. scrape data 
    tweets = user_data(formData)
    # 2. clean data 
    clean_tweets, original_tweets = clean_and_format_data(tweets)
    # 3. run model

    predictions = predict(clean_tweets, original_tweets)
    return predictions


def user_data(formData):
    """Scrape user data from Twitter based on user inputs"""

    "Input: formData dictionary from react form "
    "Outputs: scraped data"


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
    #TODO: add in split csv script
    #TODO: when a element in the array is deleted in the clean data, delete in original data also
    # Note: second return value (currently "data") would be the og tweet content 

    # creates an array of tweet content only
    tweet_content = []
    for i in data:
        tweet_content.append(i.tweet)

    return tweet_content, data
    
def predict(modelData, originalData):
    """Run model on each tweet"""
    "Inputs: modelData - list of strings (pure tweets), origonalData - data scraped from twint"
    "Outputs: json of tweets, results, risk percentage, results table"\
    
    tokenizer = RobertaTokenizer.from_pretrained('../../roberta_v2_3')
    model = RobertaForSequenceClassification.from_pretrained('../../roberta_v2_3')

    predictions = []
    for tweet in modelData:
        model_prediction = predict_tweet(tweet, model, tokenizer)
        predictions.append(model_prediction)
    
    # additional data for visualizations (original tweet content & times )
    tweet_content = []
    tweet_dates = []
    tweet_times = []
    for i in originalData:
        tweet_content.append(i.tweet)
        tweet_dates.append(i.datestamp)
        tweet_times.append(i.timestamp)

    # turns given tweets, times, and results into a list of objects used for the data table
    resultTable = [{"tweet": c, "date": d, "time": t, "risk": r}
                   for c, d, t, r in zip(tweet_content, tweet_dates, tweet_times, predictions)]

    #calculating risk percentage based on results 
    if len(predictions) != 0:
        percentage = np.mean(predictions) * 100
    else:
        percentage = -1

    # return all_tweets
    return jsonify({'percentage': percentage, 'table': resultTable})


def predict_tweet(tweet, model, tokenizer):
    """Predict on a single tweet"""
    "Input: string of tweet"
    "Output: 0 or 1"


    print('predicting single tweet', tweet)
    inputs = tokenizer(tweet, return_tensors="pt")
    model.eval()
    output = model(inputs['input_ids'], inputs['attention_mask'], labels=None)
    output = torch.argmax(output[0])
    # print("tweet: ", tweet)
    # print("prediction: ", output.item())
    return output.item()