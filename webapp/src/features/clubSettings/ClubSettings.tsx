import { useState } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import HostList from "./HostList";
import DefaultPosterSettings from "./DefaultPosterSettings";

const ClubSettings = () => {
    const [activeTab, setActiveTab] = useState<string>("hosts");

    return (
        <Container className="mt-4">
            <h1 className="display-5 mb-4">Club Settings</h1>
            
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || "hosts")}
                className="mb-3"
            >
                <Tab eventKey="hosts" title="Hosts">
                    <HostList />
                </Tab>
                <Tab eventKey="defaultPoster" title="Default Poster">
                    <DefaultPosterSettings />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default ClubSettings;
