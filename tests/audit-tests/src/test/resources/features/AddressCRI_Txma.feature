Feature: Whenever user creates an event on Address CRI UI, TxMA S3 bucket should how a log of this event within a minute.

  @staging
  Scenario: Testing Address CRI TxMA integration
    Given the user is on Address CRI
    When the user enters their postcode and click `Find address`
    When the user chooses their address from dropdown and click `Choose address`
    When the user enters the date they moved into their current address
    When the user clicks `I confirm my details are correct`
    Then Response from Address CRI Integration displays the user's address in JSON
    When the user clicks on summaryTest and reads the sub value from JSON
    Then the audit S3 should have a new event with the postcode provided