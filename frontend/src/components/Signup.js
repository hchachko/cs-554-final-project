import React, { useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../firebase/FirebaseFunctions";
import { AuthContext } from "../firebase/Auth";
import SocialSignIn from "./SocialSignIn";
import axios from "axios";

function SignUp() {
  const { currentUser } = useContext(AuthContext);
  const [displayNamee, setDisplayNamee] = useState("");
  const [emaill, setemaill] = useState("");
  const [pwMatch, setPwMatch] = useState("");
  const handleSignUp = async (e) => {
    e.preventDefault();
    const { displayName, email, passwordOne, passwordTwo } = e.target.elements;
    if (passwordOne.value !== passwordTwo.value) {
      setPwMatch("Passwords do not match");
      return false;
    }
    setDisplayNamee(displayName.value);

    try {
      await doCreateUserWithEmailAndPassword(
        email.value,
        passwordOne.value,
        displayName.value
      );
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    const handleMongo = async (e) => {
      if (currentUser) {
        if (currentUser._delegate.displayName) {
          try {
            const { data } = await axios.post("http://localhost:4000/user", {
              username: currentUser._delegate.displayName,
              email: currentUser._delegate.email,
            });
            console.log("POOP", data);
          } catch (e) {
            console.log(e);
          }
        } else {
          try {
            const { data } = await axios.post("http://localhost:4000/user", {
              username: displayNamee,
              email: currentUser._delegate.email,
            });
            console.log("POOP", data);
          } catch (e) {
            console.log(e);
          }
        }
      }
    };
    handleMongo();
  }, [currentUser, displayNamee]);

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="card">
      <h1>Sign up</h1>
      {pwMatch && <h4 className="error">{pwMatch}</h4>}
      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label>
            Name:
            <input
              className="form-control"
              required
              name="displayName"
              type="text"
              placeholder="Name"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Email:
            <input
              className="form-control"
              required
              name="email"
              type="email"
              placeholder="Email"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Password:
            <input
              className="form-control"
              id="passwordOne"
              name="passwordOne"
              type="password"
              placeholder="Password"
              autoComplete="off"
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Confirm Password:
            <input
              className="form-control"
              name="passwordTwo"
              type="password"
              placeholder="Confirm Password"
              autoComplete="off"
              required
            />
          </label>
        </div>
        <button
          id="submitButton"
          name="submitButton"
          className="button"
          type="submit"
        >
          Sign Up
        </button>
      </form>
      <br />
      <SocialSignIn />
    </div>
  );
}

export default SignUp;
