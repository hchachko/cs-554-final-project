import React, { useContext, useState, useEffect } from "react";
import SocialSignIn from "./SocialSignIn";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../firebase/Auth";
import axios from "axios";
import {
  doSignInWithEmailAndPassword,
  doPasswordReset,
} from "../firebase/FirebaseFunctions";

function SignIn() {
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState();
  const handleLogin = async (event) => {
    event.preventDefault();
    let { email, password } = event.target.elements;
    let url = "http://localhost:4000/user/" + email.value;
    try {
      console.log(url);
      const { data } = await axios.get(url);
      if (data.googleAuth === false) {
        try {
          await doSignInWithEmailAndPassword(email.value, password.value);
        } catch (error) {
          alert(error);
        }
      } else {
        alert(
          "This email is associated with a Google authenticated account, please sign in with Google"
        );
      }
    } catch (e) {
      console.log(e);
      try {
        await doSignInWithEmailAndPassword(email.value, password.value);
      } catch (error) {
        alert("Username or password incorrect.");
      }
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
              googleAuth: true,
            });
            console.log("POOP", data);
          } catch (e) {
            console.log(e);
          }
        }
      }
    };
    handleMongo();
  }, [currentUser]);

  const passwordReset = (event) => {
    event.preventDefault();
    let email = document.getElementById("email").value;
    if (email) {
      doPasswordReset(email);
      alert("Password reset email was sent");
    } else {
      alert(
        "Please enter an email address below before you click the forgot password link"
      );
    }
  };
  if (currentUser) {
    return <Navigate to="/" />;
  }
  return (
    <div className="card">
      <div></div>
      <h1>Log in</h1>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>
            Email:
            <input
              className="form-control"
              name="email"
              id="email"
              type="email"
              placeholder="Email"
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Password:
            <input
              className="form-control"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="off"
              required
            />
          </label>
        </div>
        <button type="submit" className="button">
          Log in
        </button>

        <button className="button" onClick={passwordReset}>
          Forgot Password
        </button>
      </form>

      <br />
      <SocialSignIn />
    </div>
  );
}

export default SignIn;
