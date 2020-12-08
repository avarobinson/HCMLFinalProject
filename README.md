# HCMLFinalProject
Detecting Depression Via Twitter

HOW TO RUN LOCALLY 

Clone this repo
  - in order to get the model locally you will need to use git lfs 
  1. install git lfs 
    - HomeBrew: $ brew install git-lfs
    - MacPorts: $ port install git-lfs
    (https://docs.github.com/en/free-pro-team@latest/github/managing-large-files/installing-git-large-file-storage)
  2. pull model: $ git lfs pull

To create and start virtual environment: 
  1. $ cd depression-detector
  2. $ cd api 
  3. $ pip install virtualenv
  4. $ python3 -m venv venv 
      (make sure to run this to name your virtual environment venv)
  5. $ source venv/bin/activate
  
To get dependencies: 
  1. $ cd depression-detector
  2. $ npm install  
  3. $ pip install -r requirements.txt 
  
To start frontend: 
  1. cd depression-detector
  2. $ yarn start 
  NOTE: if you are having issues with Yarn, please try - 
    MAC: brew install 
    PC: choco install yarn
  3. open up browser window and paste http://localhost:3000. 
  
To start backend: 
  1. switch to a second terminal and navigate to depression-detector
  2. $ yarn start-api
Note: if this doesn't work, make sure your virtual environment is called venv (step 4 above). If not, cd into api and run venv/bin/flask run with your correct virtual env name  

If this doesn't work, try again with a new virtual environment :) 
  
  
  
  
