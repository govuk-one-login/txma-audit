Feature: Whenever user creates an event on Fraud CRI UI, TxMA S3 bucket should have a log of this event within a minute.

 # @staging

  Scenario: Testing Address CRI TxMA integration
    Given the user is on "Fraud" CRI
    When the user searches Kenneth Decerqueira and click `Search`
    When the user clicks on `Go to Fraud CRI Staging`
    And I navigate to the verifiable issuer to check for a Valid response from experian
    Then Response from CRI displays the subject identifier
    Then the audit S3 should have a new event with the subject identifier and event_name "IPV_FRAUD_CRI_START"
