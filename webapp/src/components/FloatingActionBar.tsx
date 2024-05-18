import { ReactNode } from "react";
import "./FloatingActionBar.css";
import { Navbar } from "react-bootstrap";

type Props = {
    hidden: boolean,
    children: ReactNode,
}

const FloatingActionBar = ({hidden = false, children}: Props) => {
    return <Navbar hidden={hidden} sticky="bottom" className="floatingActionBar">{ children }</Navbar>
};

export default FloatingActionBar;