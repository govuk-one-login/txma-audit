@staging
Feature: Whenever a user creates an event on App UI, the TxMA S3 bucket should show a log of this event within a minute

  Scenario: Check a journey from APP is logged into TxMA
    Given user is on APP API
    When user clicks on continue
    When the user selects the session id
    Then the audit S3 should have a new event with the user identifier subjectId