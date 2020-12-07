# HCMLFinalProject
detecting depression via twitter

To create and start virtual environment: 
  1. $ cd depression-detector
  2. $ cd api 
  3. $ pip install virtualenv
  4. $ python3 -m venv venv 
      ** make sure to run this to name your virtual environment venv
  5. $ source venv/bin/activate
  
To get dependencies: 
  1. $ cd depression-detector
  2. $ npm install  
  3. $ pip install -r requirements.txt 
  
To start frontend: 
  1. cd depression-detector
  2. $ yarn start 
  3. open up browser window and paste http://localhost:3000. 
  
To start backend: 
  1. switch to a second terminal and navigate to depression-detector
  2. $ yarn start-api
  Note: if this doesn't work, make sure your virtual environment is called venv (step 4 above). If not, cd into api and run venv/bin/flask run with your correct virtual env name


Note: may need to do git lfs install and git lfs pull to get the entire model 
  
  
  
  
  
