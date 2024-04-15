import React, { ReactElement }from "react";
import { Col, Container, Row, } from 'react-bootstrap';

type Props = {
    children: ReactElement
}

const AnonymousLayout = ({ children }: Props) => <Container className="mt-1">
        <Row className="justify-content-md-center pt-5">
            <Col md={6}>{ children }</Col>
        </Row>
    </Container>

export default AnonymousLayout;