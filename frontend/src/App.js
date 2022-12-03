import React from 'react';
import './App.css';
import './styling.css';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import RaceHome from './components/RaceHome';
import RacePublic from './components/RacePublic';
import RacePrivate from './components/RacePrivate';
import {BrowserRouter as Router, Route, NavLink, Routes} from 'react-router-dom';

function App() {
  return (
    <Router>
        <div className="App">
            <header className="App-header">
                <h1>SpeedType</h1>
                <nav>
                    <NavLink to='/' className={({isActive}) => isActive ? 'navLinkActive' : 'navLink'}>
                        Home
                    </NavLink>
                    <NavLink to='/game' className={({isActive}) => isActive ? 'navLinkActive' : 'navLink'}>
                        Play
                    </NavLink>
                    <NavLink to='/login' className={({isActive}) => isActive ? 'navLinkActive' : 'navLink'}>
                        Login
                    </NavLink>
                    <NavLink to='/signup' className={({isActive}) => isActive ? 'navLinkActive' : 'navLink'}>
                        Signup
                    </NavLink>
                </nav>
            </header>
            <br />
            <div className='body'>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/signup' element={<Signup />} />
                    <Route path='/game' element={<RaceHome />} />
                    <Route path='/game/public' element={<RacePublic />} />
                    <Route path='/game/private' element={<RacePrivate />} />
                </Routes>
            </div>
        </div>
    </Router>
  );
}

export default App;
