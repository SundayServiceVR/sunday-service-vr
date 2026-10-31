Feature: Building the lineup

  Scenario: Host closes signups, builds the lineup, and updates the whiteboard
    Given an event with signups open from "Lineup DJ Alpha" and "Lineup DJ Beta"
    And I am signed in as the host
    When I close signups and add every signup to the lineup
    And I update the whiteboard
    Then signups are closed and the event has 2 lineup slots
    And the whiteboard lists "Lineup DJ Alpha" and "Lineup DJ Beta"
