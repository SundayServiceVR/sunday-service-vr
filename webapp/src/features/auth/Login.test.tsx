import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";

describe("Login", () => {
    it("Runs a test", () => {
        render(<BrowserRouter><Login /></BrowserRouter>)
        expect(screen.getByText("Organizer Login")).toBeInTheDocument();
    });
});