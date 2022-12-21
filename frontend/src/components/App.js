import React from "react";
import "./App.css";
import "./styling.css";
import Home from "./Home";
import Signup from "./Signup";
import RaceHome from "./RaceHome";
import RacePublic from "./RacePublic";
import PrivateRoute from "./PrivateRoute";
import RacePrivate from "./RacePrivate";
import SignIn from "./SignIn";
import Leaderboard from "./Leaderboard";
import Account from "./Account";
import Navigation from "./Navigation";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../firebase/Auth";
import NewGenreAndQuote from "./NewGenreAndQuote";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <br />
          <div className="body">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<SignIn />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/game" element={<PrivateRoute />}>
                <Route path="/game" element={<RaceHome />} />
              </Route>
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/game/public" element={<RacePublic />} />
              <Route path="/game/private" element={<RacePrivate />} />
              <Route path="/account" element={<PrivateRoute />}>
                <Route path="/account" element={<Account />} />
              </Route>
              <Route path="/genre" element={<PrivateRoute />}>
                <Route path="/genre" element={<NewGenreAndQuote />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
