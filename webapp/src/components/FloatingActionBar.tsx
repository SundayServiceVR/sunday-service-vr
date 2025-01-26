import { ReactNode } from "react";
import { Navbar } from "react-bootstrap";
import { createPortal } from "react-dom";
import "./FloatingActionBar.css";
type Props = {
    hidden: boolean,
    children: ReactNode,
}

const FloatingActionBar = ({hidden = false, children}: Props) => {
    return createPortal(
        <Navbar hidden={hidden} sticky="bottom" className="floatingActionBar py-0">{ children }</Navbar>,
      document.body
    )
};

export default FloatingActionBar;