import twint
import nest_asyncio
## import pandas as pd
nest_asyncio.apply()


## Username variable-- not sure how the script will grab the front end variable
# Just hardcoded the user for now, replace 

user = 'realDonaldTrump'

a = twint.Config()
## Uncomment out limit depending on if you want to limit the number of tweets it grabs
## depending on user, could go on for a really long time
# a.Limit = 10
a.Username = user
a.Pandas = True
twint.run.Search(a)

