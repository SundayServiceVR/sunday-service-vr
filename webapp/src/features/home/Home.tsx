import { Card, Container } from "react-bootstrap";
import "./Home.css";
import { CurrentOrNextEvent } from "../../components/currentOrNextEvent/CurrentOrNextEvent";
import { signupSheetUrl } from "../../util/constants";

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
        extra: [
            {
                title: "Signup Sheet",
                url: signupSheetUrl
            },
            {
                title: "Performer Stream Links",
                url: "https://docs.google.com/spreadsheets/d/1nsAQAiOsuZQcpBBg44SZ8jUvFtXI6WNKE8-WSo9_kiE/edit?usp=drive_link"
            },
            {
                title: "Fallback Tracking Sheet",
                url: "https://docs.google.com/spreadsheets/d/1k-WANG5zbwaLeEEMpGy81b0Itd-AWd03Lotdff9B2aQ/edit?gid=350139617#gid=350139617"
            }
        ]
    },
    {
        title: "Discord",
        text: "S4 Discord",
        url: "https://discord.com/channels/1004489038159413248",
    },
];

const Home = () =>
    <section>
        <CurrentOrNextEvent />
        <Container className="my-3">
            <h2 className="mb-3">Helpful Links</h2>
            <div className="linksList">
                {
                    helpfulLinks.map((entry, entryIndex) =>
                        <Card
                            key={`entry${entryIndex}`}
                            style={{ "maxWidth": "400px" }}
                        >
                            <Card.Header>
                                <Card.Title>{entry.title}</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <p><a href={entry.url} target="_blank">{entry.url}</a></p>
                                <p>{entry.text}</p>
                                {entry?.extra ? (
                                    <ul>
                                        {entry.extra.map((extraEntry, extraIndex) =>
                                            <li key={`entry${entryIndex}extra${extraIndex}`}>
                                                <a href={extraEntry.url} target="_blank">
                                                    {extraEntry.title}
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                ) : null}
                            </Card.Body>
                        </Card>
                    )
                }
            </div>
        </Container>

    </section>

export default Home;