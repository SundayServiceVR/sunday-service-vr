import { Spinner as BootstrapSpinner } from "react-bootstrap";

import S4Logo from "../../assets/svg/S4_Logo.svg?react";

import "./spinner.css";

type SpinnerProps = {
  type: "simple"|"logo"
}
const Spinner = ({ type = "simple" }: SpinnerProps) => {
  switch (type) {
    case "logo": {
      return (
        <div className="spinnerWrapper">
          <S4Logo className="logoSpinner withFade" />
        </div>
      );
    }
    case "simple":
    default: {
      return (
        <div className="spinnerWrapper">
          <BootstrapSpinner />
        </div>
      );
    }
  }
}

export default Spinner;