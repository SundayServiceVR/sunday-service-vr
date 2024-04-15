
import React from "react"
import { auth, sundayServiceAuthProvder } from "../firebase/auth";
import { signInWithRedirect } from "firebase/auth";

const LoginToDiscord = () => {
    const login = () => {
        signInWithRedirect(auth, sundayServiceAuthProvder);
    }
    return <button onClick={login}>Log In with Discord</button>
}

export default LoginToDiscord;