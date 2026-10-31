Feature: Hosting an event

  Scenario: Host creates an event with signups open
    Given I am signed in as the host
    When I create an event with signups open
    Then the event exists with signups open

  Scenario: Host picks an existing host from the single host field
    Given I am signed in as the host
    And a host named "E2E Existing Host" exists
    When I create an event hosted by the existing host "E2E Existing Host"
    Then the event is hosted by "E2E Existing Host"

  Scenario: Host creates a new host without a poster while creating an event
    Given I am signed in as the host
    When I create an event with a new host "E2E Brand New Host" and no poster
    Then the event is hosted by "E2E Brand New Host"
    And the host "E2E Brand New Host" has no poster
