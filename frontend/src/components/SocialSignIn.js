import React from "react";
import { doSocialSignIn } from "../firebase/FirebaseFunctions";

const SocialSignIn = () => {
  const socialSignOn = async (provider) => {
    try {
      await doSocialSignIn(provider);
    } catch (error) {
      alert(error);
    }
  };
  return (
    <div>
      <img
        width="250"
        height="70"
        onClick={() => socialSignOn("google")}
        alt="google signin"
        src="/imgs/btn_google_signin.png"
      />
    </div>
  );
};

export default SocialSignIn;
