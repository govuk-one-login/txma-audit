@build

Feature: Event data journey from event processing lambda to Accounts SQS queue

  Scenario Outline: Check auth message lands successfully in thee Accounts SQS queue
    Given the SQS data file "AuthOIDC/AuthtoAccounts" is available for the "<account>" team
    When the "<account>" lambda is invoked
    Then the SQS below should have a new event matching the respective "<account>" output file "Accounts_expected" in the "AuthOIDC" folder
    Examples:
      | account         |
      | AuthOIDC        |



