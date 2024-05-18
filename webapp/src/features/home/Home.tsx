import { Card } from "react-bootstrap";
import "./Home.css";

const helpfulLinks = [
    {
        title: "Hosting Guide",
        text: "This is the best place to start if you have any questions on how to host!",
        url: "https://docs.google.com/document/d/1H1166WjDwJjUBRMHFnx76tX15OLzm-rb-iykcRmpzXc/edit?usp=sharing",
    },    
    {
        title: "S4 Drive Folder",
        text: "All the spreadsheets and documents relevant to hosting can be found here.",
        url: "https://drive.google.com/drive/u/1/folders/1LSc92ZMwD4B68Ocx0dwKJSE2Eek21SET",
    },
    {
        title: "Performer Interest Sheet (Q2)",
        text: "This is where the performers actually sign up.",
        url: "https://docs.google.com/spreadsheets/d/1xzejwFYiaFkS7atfWf9YJe7nmZqF_UxwZBjkigoL4DI/edit?usp=sharing",
    },
    {
        title: "Streaming Assets",
        text: "Images and logos that are used in our streams, including DJ logos.",
        url: "https://drive.google.com/drive/u/1/folders/1tuZddCNBcFpVFjyk3XKB6M1d64mAnjX8",
    },
    {
        title: "Whiteboard Endpoint",
        text: "Just some under-the-hood stuff",
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