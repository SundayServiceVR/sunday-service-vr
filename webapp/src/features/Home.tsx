import React from "react";
import { Button, Card, Stack } from "react-bootstrap";
import "./Home.css";

const helpfulLinks = [
    {
        title: "Event Management Guidelines",
        text: "How S4 is run",
        url: "https://drive.google.com/drive/u/1/folders/1LSc92ZMwD4B68Ocx0dwKJSE2Eek21SET",
    },
    {
        title: "Streaming Assets",
        text: "Images and logos that are used in our streams",
        url: "https://www.dropbox.com/scl/fo/9cmhbf92l6qgr124vhzap/h?dl=0&e=1",
    },
    {
        title: "Interest Sheets",
        text: "These are our actual signups",
        url: "https://docs.google.com/spreadsheets/u/0/d/1A3eHAnL_-YbwLIezClQ13_R63jdX--ugv5XuOgGfRT0/htmlview",
    },
    {
        title: "Whiteboard Endpoint",
        text: "Just some under-the-hood shit",
        url: "https://whiteboard-diczrrhb6a-uc.a.run.app/",
    },
];

const Home = () =>
    <section>
        <h2 className="display-6">Helpful Links</h2>
        <div className="linksList">
            {
                helpfulLinks.map((entry) => <Card style={{ "maxWidth": "400px" }}>
                    <Card.Header>
                        <Card.Title>{entry.title}</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <p><a href={entry.url}>{entry.url}</a></p>
                        <p>{entry.text}</p>
                    </Card.Body>
                </Card>)
            }
        </div>
    </section>

export default Home;