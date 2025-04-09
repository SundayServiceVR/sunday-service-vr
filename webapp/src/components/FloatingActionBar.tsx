import { ReactNode } from "react";
import { Collapse, Navbar } from "react-bootstrap";
import { createPortal } from "react-dom";
import "./FloatingActionBar.css";
type Props = {
    hidden: boolean,
    children: ReactNode,
}

const FloatingActionBar = ({ hidden = false, children }: Props) => {
    return createPortal(
        <>
            <div style={{ height: "60px" }} />
            <Collapse in={!hidden} className="mt-5">
                <Navbar className="floatingActionBar fixed-bottom py-0 w-100 bg-light bg-gradient">
                    <div className="w-100 p-2">
                        {children}
                    </div>
                </Navbar>
            </Collapse >
        </>
        , document.body)
};

export default FloatingActionBar;