@staging
Feature: Whenever a user creates an event on App UI, the TxMA S3 bucket should show a log of this event within a minute

  Scenario: Check a journey from APP is logged into TxMA
    Given user is on APP API stub
    When user clicks on continue on the Doc checking page
    When the user selects the session id from the cookies
    Then the audit S3 should have a new event with the user identifier sessionId
