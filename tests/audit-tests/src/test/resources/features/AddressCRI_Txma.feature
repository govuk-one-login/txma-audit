@staging
Feature: Whenever user creates an event on Address CRI UI, TxMA S3 bucket should how a log of this event within a minute.

  Scenario: Testing Address CRI TxMA integration
    Given the user is on "Address" CRI
    When the user enters their postcode and click `Find address`
    When the user chooses their address from dropdown and click `Choose address`
    When the user enters the date they moved into their current address
    When the user clicks `I confirm my details are correct`
    Then Response from CRI displays the subject identifier
    Then the audit S3 should have a new event with the subject identifier and event_name "IPV_ADDRESS_CRI_START"