@staging
Feature: Whenever a user creates an event on Auth UI, the TxMA S3 bucket should show a log of this event within a minute

  Scenario: Check a journey from Auth is logged into TxMA
    Given user is on Auth API stub
    When user selects P2 as the Level of Confidence
    When the user selects the persistent session id from the cookies
    Then the audit S3 should have a new event with the user identifier persistent sessionId