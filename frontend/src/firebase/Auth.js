import React, { useState, useEffect } from "react";
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import firebase from "firebase/compat/app";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const firebaseConfig = {
    apiKey: "AIzaSyAOw97yHq9wLjuEExVfLgJUhN81LIk6j2M",
    authDomain: "cs554-d4db1.firebaseapp.com",
    projectId: "cs554-d4db1",
    storageBucket: "cs554-d4db1.appspot.com",
    messagingSenderId: "51147416105",
    appId: "1:51147416105:web:96f7197a4f6b97f97e3238",
    measurementId: "G-YV4S1YRTN5",
  };
  const app = firebase.initializeApp(firebaseConfig);
  //const analytics = getAnalytics(app);
  const auth = firebase.auth();
  const db = firebase.firestore();
  console.log("poop", app);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoadingUser(false);
    });
  }, []);

  if (loadingUser) {
    return (
      <div>
        <h1>Loading....</h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
