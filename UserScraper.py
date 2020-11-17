import twint
import nest_asyncio
import sys
from datetime import date
import datetime
import pandas as pd
nest_asyncio.apply()


## Username variable-- not sure how the script will grab the front end variable
# Just hardcoded the user for now, replace 
def userPredict(username, time):
    user = username #'realDonaldTrump'
      
    a = twint.Config()
    ## Uncomment out limit depending on if you want to limit the number of tweets it grabs
    ## depending on user, could go on for a really long time
    a.Limit = 10
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
    print(all_tweets)
    return all_tweets

if __name__ == __name__:
    username = sys.argv[1]
    timeframe = sys.argv[2]
    userPredict(username, timeframe)