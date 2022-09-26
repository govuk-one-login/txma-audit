@staging
Feature: Whenever user creates an event on KBV CRI UI, TxMA S3 bucket should have a log of this event within a minute.

  Scenario: KBV to TxMA integration test in Staging
    Given the user is on "KBV" CRI
    When the user searches Kenneth Decerqueira and click `Search`
    When the user clicks on `Go to KBV CRI Staging`
    When the user answers the "first" question correctly
    When the user answers the "second" question correctly
    When the user answers the "third" question correctly
    Then Response from CRI displays the subject identifier
    Then the audit S3 should have a new event with the subject identifier and event_name "IPV_KBV_CRI_START"