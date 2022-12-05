import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../firebase/Auth";
import SignOutButton from "./SignOutButton";

const Navigation = () => {
  const { currentUser } = useContext(AuthContext);
  return <div>{currentUser ? <NavigationAuth /> : <NavigationNonAuth />}</div>;
};

const NavigationAuth = () => {
  return (
    <header className="App-header">
      <h1>SpeedType</h1>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "navLinkActive" : "navLink")}
        >
          Home
        </NavLink>
        <NavLink
          to="/game"
          className={({ isActive }) => (isActive ? "navLinkActive" : "navLink")}
        >
          Play
        </NavLink>
        <NavLink
          to="/account"
          className={({ isActive }) => (isActive ? "navLinkActive" : "navLink")}
        >
          Account
        </NavLink>
      </nav>
    </header>
  );
};

const NavigationNonAuth = () => {
  return (
    <header className="App-header">
      <h1>SpeedType</h1>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "navLinkActive" : "navLink")}
        >
          Home
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) => (isActive ? "navLinkActive" : "navLink")}
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className={({ isActive }) => (isActive ? "navLinkActive" : "navLink")}
        >
          Signup
        </NavLink>
      </nav>
    </header>
  );
};

export default Navigation;
