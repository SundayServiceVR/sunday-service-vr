import { Card, Container, Spinner, Row, Col } from "react-bootstrap";
import { CurrentOrNextEvent } from "../../components/currentOrNextEvent/CurrentOrNextEvent";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./Home.css";

const HELPFUL_LINKS = [
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
                title: "Performer Stream Links",
                url: "https://docs.google.com/spreadsheets/d/1nsAQAiOsuZQcpBBg44SZ8jUvFtXI6WNKE8-WSo9_kiE/edit?usp=drive_link",
            },
            {
                title: "Fallback Tracking Sheet",
                url: "https://docs.google.com/spreadsheets/d/1k-WANG5zbwaLeEEMpGy81b0Itd-AWd03Lotdff9B2aQ/edit?gid=350139617#gid=350139617",
            },
        ],
    },
    {
        title: "Discord",
        text: "S4 Discord",
        url: "https://discord.com/channels/1004489038159413248",
    },
];

const Home = () => {
    const [signupSheetUrl, setSignupSheetUrl] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSignupUrl = async () => {
            const firestore = getFirestore();
            const docRef = doc(firestore, "/global/global_settings");
            try {
                const docSnap = await getDoc(docRef);
                const url = docSnap.exists() ? docSnap.data().signup_url : "unable to find signup url";
                setSignupSheetUrl(url);
            } catch (error) {
                console.error("Error fetching signup URL:", error);
                setSignupSheetUrl("unable to find signup url");
            } finally {
                setLoading(false);
            }
        };

        fetchSignupUrl();
    }, []);

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>;
    }

    return <section>
        {/* Hero Section */}
        <div className="hero-section text-center py-5 bg-light">
            <h1 className="display-4">Welcome to Sunday Service VR</h1>
            <p className="lead">Your one-stop platform for hosting and participating in virtual events.</p>
            <div className="mt-4">
                <CurrentOrNextEvent />
            </div>
        </div>

        <Container className="my-5">
            {/* Signup Sheet Section */}
            <h2 className="display-6 mb-4 text-center">Signup Sheet</h2>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <Card.Title>Signup Sheet</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p><a href={signupSheetUrl} target="_blank" rel="noopener noreferrer">{signupSheetUrl}</a></p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Helpful Links Section */}
            <h2 className="display-6 mt-5 mb-4 text-center">Helpful Links</h2>
            <Row className="g-4">
                {
                    HELPFUL_LINKS.map((entry, entryIndex) =>
                        <Col md={6} lg={4} key={`entry${entryIndex}`}>
                            <Card className="shadow-sm h-100">
                                <Card.Header className="bg-secondary text-white">
                                    <Card.Title>{entry.title}</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <p><a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.url}</a></p>
                                    <p>{entry.text}</p>
                                    {entry?.extra ? (
                                        <ul>
                                            {entry.extra.map((extraEntry, extraIndex) =>
                                                <li key={`entry${entryIndex}extra${extraIndex}`}>
                                                    <a href={extraEntry.url} target="_blank" rel="noopener noreferrer">
                                                        {extraEntry.title}
                                                    </a>
                                                </li>
                                            )}
                                        </ul>
                                    ) : null}
                                </Card.Body>
                            </Card>
                        </Col>
                    )
                }
            </Row>
        </Container>
    </section>;
}

export default Home;