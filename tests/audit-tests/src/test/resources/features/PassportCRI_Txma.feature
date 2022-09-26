@staging
Feature: Whenever a user creates an event on Passport CRI UI, TxMA S3 bucket should show a log of this event within a minute.

  Scenario: Check a successful address journey from Passport CRI is logged into TxMA
    Given user is on Passport CRI staging
    When user completes address journey successfully
    Then the audit S3 should have a new event with the user identifier and event_name "IPV_PASSPORT_CRI_START"