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
    
  4) With the server running, open a seperate console window. Move to the frontend directory:
  
    cd frontend
    
  5) Install all necessary dependencies (IMPORTANT- must be done with the following flag as Material-UI has issues with React 18):
  
    npm install --legacy-peer-deps
    
  6) Start the react application:
  
    npm start
    
  And that's it! Enjoy Typeracing :)
