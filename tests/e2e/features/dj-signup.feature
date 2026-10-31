Feature: DJ signup

  Scenario: DJ signs up for an event with open signups
    Given an event with signups open
    And I am signed in as a new DJ
    When I complete the signup wizard
    Then I see that I am signed up
    And the event has 1 signup from me

  Scenario: DJ cannot sign up when signups are closed
    Given an event with signups closed
    And I am signed in as a new DJ
    When I open the signup page for the event
    Then I see the "Signups Closed" notice
    And I cannot start a signup
