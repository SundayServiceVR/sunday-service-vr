import { ReactNode } from "react";
import { Collapse, Navbar } from "react-bootstrap";
import { createPortal } from "react-dom";
import "./FloatingActionBar.css";
type Props = {
    hidden: boolean,
    children: ReactNode,
}

const FloatingActionBar = ({hidden = false, children}: Props) => {
    return createPortal(
        <Navbar sticky="bottom" className="floatingActionBar py-0 w-100 bg-light bg-gradient">
            <Collapse in={!hidden}>
            <div className="w-100 p-2">
                { children }
            </div>
            </Collapse>
        </Navbar>,
      document.body
    )
};

export default FloatingActionBar;