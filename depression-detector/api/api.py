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
from pandas import DataFrame
import re
import time
import itertools

app = Flask(__name__)
# CORS(app)


@app.route('/api/v1', methods = ['POST'])
def scrape_and_predict():
    start_time = time.time()
    # handling timeouts 
        # handling too many tweets
        # case 1: takes too long to predict 
        # check time at each prediction --> if at 110 then return 
    # this acts as the main function for a POST request
    formData = request.json
    # 1. scrape data 
    stime2 = time.time()
    tweets = user_data(formData)
    # tweets = list(itertools.repeat(tweets[0], 1200)) # 20 copies of "a"
    ftime2 = time.time()
    print('scraping time', ftime2-stime2)
    # print('scraped tweets', tweets)
    # 2. clean data 
    stime3 = time.time()
    clean_tweets, original_tweets = clean_and_format_data(tweets)
    ftime3 = time.time()
    print('cleaning time', ftime3 - stime3)
    # original tweets will be a list of lists where the sublist has a single tweet object
    # 3. run model
    stime4 = time.time()
    predictions = predict(clean_tweets, original_tweets, start_time)
    ftime4 = time.time()
    print('predict time', ftime4 - stime4)
    # print('done predicting')
    end_time = time.time()
    total = end_time - start_time
    print('NUMBER TWEETS', len(tweets))
    print('TIME', total)
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
    # Note: second return value (currently "data") would be the og tweet content 
    stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"]

    # creates an array of tweet content only
    tweet_content = []
    for i in data:
        tweet_content.append(i.tweet)
    
    df = DataFrame (tweet_content, columns=['tweet'])
    
    # make lowercase
    df["tweet"] = df["tweet"].str.lower()
    
    # remove stopwords 
    df['tweet'] = df['tweet'].apply(lambda x: ' '.join([item for item in x.split() if item not in stopwords]))
    
    # remove all links/urls 
    # def remove_url(txt):
    #     return " ".join(re.sub("([^0-9A-Za-z \t])|(\w+:\/\/\S+)", "", txt).split())
    # all_tweets_no_urls = [remove_url(tweet) for tweet in df['tweet']]
    # all_tweets_no_urls[:5]
    df['tweet'] = df['tweet'].apply(lambda x: re.split('https:\/\/.*', str(x))[0])
    df['tweet'] = df['tweet'].apply(lambda x: re.split('http:\/\/.*', str(x))[0])
    # remove emojis 
    df['tweet'] = df['tweet'].apply(lambda x: x.encode('ascii', 'ignore').decode('ascii'))
    
    # remove hashtags 
    df['tweet'] = df['tweet'].str.replace('#', '')
    # remove usernames 
    # for i in range(len(df['tweet'])):
    #     try:
    #         df['tweet'][i] = df['tweet'].str.split(' ')[i][0]
    #     except AttributeError:    
    #         df['tweet'][i] = 'other'

    # remove URLs, RTs, and twitter handles
    for i in range(len(df['tweet'])):
        df['tweet'][i] = " ".join([word for word in df['tweet'][i].split()
                                if 'http' not in word and '@' not in word and '<' not in word])

    # print('clean vs. orig 1', len(df.values.tolist()), len(data))
    # get indices of null values and empty strings 
    null_idx = df[df['tweet'].isnull()].index.tolist()
    null_idx2 = df.index[df['tweet']==''].tolist()
    null_idx = null_idx + null_idx2
   
    # remove null values from origonal data 
    df_orig_data = DataFrame (data, columns=['tweet'])
    df_orig_data = df_orig_data.drop(index=null_idx)

    # remove null values 
    # df = df[df['tweet'].notnull()]
    df = df.drop(index=null_idx)
    # convert to list 
    clean_tweet_content = df.values.tolist()
    orig_data = df_orig_data.values.tolist()
    
    # print('clean vs. orig', len(clean_tweet_content), len(orig_data))
    return clean_tweet_content, orig_data
    
def predict(modelData, originalData, start_time):
    """Run model on each tweet"""
    "Inputs: modelData - list of strings (pure tweets), origonalData - data scraped from twint"
    "Outputs: json of tweets, results, risk percentage, results table"\
    
    tokenizer = RobertaTokenizer.from_pretrained('../../roberta_v3')
    model = RobertaForSequenceClassification.from_pretrained('../../roberta_v3')

    predictions = []
    for tweet in modelData:
        if time.time() - start_time <= 110:
            model_prediction = predict_tweet(tweet, model, tokenizer)
            predictions.append(model_prediction)
        else:
            # taking too long --> return ASAP
            break
    
    # additional data for visualizations (original tweet content & times )
    tweet_content = []
    tweet_dates = []
    tweet_times = []
    for i in originalData:
        tweet_content.append(i[0].tweet)
        tweet_dates.append(i[0].datestamp)
        tweet_times.append(i[0].timestamp)

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


    # print('predicting single tweet', tweet)
    # inputs = tokenizer(tweet, return_tensors="pt")
    # model.eval()
    # output = model(inputs['input_ids'], inputs['attention_mask'], labels=None)
    # output = torch.argmax(output[0])
    # # print("tweet: ", tweet)
    # # print("prediction: ", output.item())
    # return output.item()

    inputs = tokenizer(tweet, return_tensors="pt")
    model.eval()
    output = model(inputs['input_ids'], inputs['attention_mask'], labels=None)
    sigmoid = torch.nn.Sigmoid()
    softmax = torch.nn.Softmax(dim=0)
    output = softmax(sigmoid(output[0].squeeze()))
    output_class = torch.argmax(output)
    output = torch.max(output)
    if output_class == 0:
        output = 1 - output 
    # print("tweet: ", tweet)
    # print("prediction: ", output.item())
    return output.item()