Feature: KBV-TxMA Integration.
  Kenneth Decerqueira is an Experian test user.

  @staging
  Scenario: KBV to TxMA integration test in Staging
    Given the user is on KBV CRI Staging
    When the user searches Kenneth Decerqueira and click `Search`
#    Then the user is shown `Experian UAT user search results`
    When the user clicks on `Go to KBV CRI Staging`
    When the user answers the first question correctly
    When the user answers the second KBV question correctly
    When the user answers the third KBV question correctly
    Then the user should get verificationCode 2
    When the user clicks on summaryTest and reads the sub value from JSON
    Then the audit S3 should have a new event with the postcode provided