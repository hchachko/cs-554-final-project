# cs-554-final-project: TypeRacer Game

  Pre-Reqs:
    
  1) Have Node installed: 
  
    brew install node
  
  2) Imagemagick client installed:
    
    brew install imagemagick
    
  3) Have mongo installed and running:
  
    brew install mongod
    
  How to Compile:
  
  1) Open a console window. Move to the backend directory:
    
    cd backend
    
  2) Install all necessary dependencies:
    
    npm install
    
  3) Start the express server:
    
    npm start
    
  4) With the server running, open a separate console window. Move to the frontend directory:
  
    cd frontend
    
  5) Install all necessary dependencies (IMPORTANT- must be done with the following flag as Material-UI has issues with React 18):
  
    npm install --legacy-peer-deps
    
  6) Start the react application:
  
    npm start
    
  And that's it! Enjoy Typeracing :)
  
Heroku Version:
  No steps required! Just enter the following URL: https://cs554-final-project.herokuapp.com/ 
  Something to note: heroku uses a mongo cluster for its database needs, meaning it runs a different database than  the local host.
  
  
  To access the local version branch on github, use the "main" branch. To access the heroku branch, use the "heroku version" branch.

