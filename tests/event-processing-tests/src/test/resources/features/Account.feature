@build

Feature: Event data journey from event processing lambda to Accounts SQS queue

  Scenario Outline: Check auth message lands successfully in thee Accounts SQS queue
    Given the SQS data file "AuthOIDC/AuthtoAccounts" is available for the "<account>" team
    Examples:
      | account      |
      | AuthOIDC     |
#    When the "<account>" lambda is invoked
#    And the s3 below should have a new event matching the respective "<account>" output file "s3_expected" in the "lambdaToCloudwatchTests" folder
#      | fraud |



