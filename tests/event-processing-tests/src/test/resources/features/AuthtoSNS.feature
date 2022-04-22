Feature: Raw event data journey from Auth to SNS

  Scenario: Validate mandatory fields in the event data.
    Given a raw data event file <valid data> is available in SQS queue
    When lambda pulls the raw event data
    Then the event data should have the mandatory fields `timestamp` and 'event_name'
    Then the raw event data is available in the SNS

  Scenario: Verify the the message is removed from the queue after successful processing
    Given a raw data event file <valid data> is available in SQS queue
    When lambda pulls the raw event data
    Then the raw event data is available in the SNS
    Then the raw event data is removed from the SQS queue

  Scenario: Reject the event data if any of the mandatory fields are missing
    Given a raw data event file <data with missing fields> is available in SQS queue
    When lambda pulls the raw event data
    Then the event data should be rejected
    And the data is not removed from the SQS queue

    @Testing
  Scenario: Test
    Given I am on database
    When I read data
    Then data is correct

  Scenario: Remove unrecognised event data fields from the event data file.
    Given a raw data event file <data with additional fields> is available in SQS queue
    When lambda pulls the raw event data
    Then the output matches with <data file with unrecognised fields removed>
    And the cloudwatch is updated with the error
    And the raw event data is available in the SNS

  Scenario: Cloudwatch for SNS failure
    Given a raw data event file <valid data> is available in SQS queue
    When lambda pulls the raw event data
    And the SNS is down
    Then cloudwatch is updated with the SNS failure
    And the raw event data is NOT removed from SQS

















