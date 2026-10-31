Feature: Autosaving event changes

  Scenario: Changes are not saved automatically until the host opts in
    Given I am signed in as the host
    And an event with signups open
    When I open the event setup
    Then autosave is off
    When I rename the event to "Manual Rename"
    And I wait for longer than the autosave delay
    Then the stored event name is unchanged
    When I click Save
    Then the stored event name is "Manual Rename"

  Scenario: Opted-in host's changes are saved automatically
    Given I am signed in as the host
    And an event with signups open
    When I open the event setup
    And I turn on autosave
    And I rename the event to "Autosaved Rename"
    Then the stored event name becomes "Autosaved Rename"
    And the save status says "Saved"
    And there is no Save button

  Scenario: Leaving a field saves without waiting for the delay
    Given I am signed in as the host
    And an event with signups open
    When I open the event setup
    And I turn on autosave
    And I rename the event to "Blur Rename" and leave the field
    Then the stored event name becomes "Blur Rename" within 1 second

  Scenario: Autosave is remembered and never touches the whiteboard
    Given I am signed in as the host
    And an event with signups open
    When I open the event setup
    And I turn on autosave
    And I rename the event to "Quiet Rename"
    Then the stored event name becomes "Quiet Rename"
    And no whiteboard update was made
    When I reload the page
    Then autosave is on
