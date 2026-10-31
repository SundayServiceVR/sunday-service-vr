Feature: Preflight requirements

  Scenario: Host is told which requirements are missing and fixes them in place
    Given I am signed in as the host
    And an event with no host and no lineup
    And a host named "E2E Preflight Host" exists
    When I open the event preflight
    Then the board update is blocked because "Host" and "Lineup" are missing
    When I choose the host "E2E Preflight Host" in the preflight
    Then "Host" is no longer listed as missing
    And "Lineup" is still listed as missing
