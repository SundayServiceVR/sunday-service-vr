Feature: Event lifecycle

  Scenario: Host and DJs take an event from creation to the whiteboard
    Given I am signed in as the host
    When I create an event with signups open
    And DJs "Journey DJ One" and "Journey DJ Two" sign up
    And I close signups and add every signup to the lineup
    And I update the whiteboard
    Then the whiteboard lists "Journey DJ One" and "Journey DJ Two"
