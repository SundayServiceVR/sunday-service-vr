import { Outlet } from "react-router";

const WhiteboardLayout = () => {
    return <section>
        <h1 className="display-3">Whiteboard</h1>
        <p>This represents the current state of the S4 "Whiteboard".</p>
        <Outlet />
    </section>
}

export default WhiteboardLayout;