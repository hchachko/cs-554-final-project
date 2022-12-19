import React from "react";
import { doSignOut } from "../firebase/FirebaseFunctions";
import { NavLink } from "react-router-dom";

const SignOutButton = (props) => {
  return (
    <NavLink className="button" onClick={doSignOut}>
      Sign Out
    </NavLink>
  );
};

export default SignOutButton;
