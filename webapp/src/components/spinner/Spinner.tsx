import { useState, useEffect } from "react";
import { Spinner as BootstrapSpinner } from "react-bootstrap";
import { signOut } from "firebase/auth";
import { auth } from "../../util/firebase";

import S4Logo from "../../assets/svg/S4_Logo.svg?react";

import "./spinner.css";

type SpinnerProps = {
  type?: "simple"|"logo"
}
const Spinner = ({ type = "simple" }: SpinnerProps) => {
  const [showLogoutLink, setShowLogoutLink] = useState(false);

  useEffect(() => {
    if (type === "logo") {
      const timer = setTimeout(() => {
        setShowLogoutLink(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    } else {
      // Reset the logout link state if type is not logo
      setShowLogoutLink(false);
    }
  }, [type]);

  const handleLogout = () => {
    signOut(auth);
  };

  switch (type) {
    case "logo": {
      return (
        <div className="spinnerWrapper">
          <S4Logo className="logoSpinner withFade" />
          {showLogoutLink && (
            <div className="logoutMessage">
              <p>Looks like this is taking a while: This is a hotfix for some issue's we've been seeing. If you are stuck, log out and log back in.</p>
              <button onClick={handleLogout} className="btn btn-link">
                Log out
              </button>
            </div>
          )}
        </div>
      );
    }
    case "simple":
    default: {
      return (
        <div className="withFade">
          <BootstrapSpinner />
        </div>
      );
    }
  }
}

export default Spinner;