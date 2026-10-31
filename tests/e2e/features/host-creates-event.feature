Feature: Hosting an event

  Scenario: Host creates an event with signups open
    Given I am signed in as the host
    When I create an event with signups open
    Then the event exists with signups open
