Feature: Raw event data journey from KBV to SNS

  Scenario: Verify the event data is successfully processed from SQS to SNS
    Given a raw data event file <valid data from KBV> is available in SQS queue
    When lambda pulls the raw event data
    Then the raw event data is available in the SNS
    Then the raw event data is removed from the SQS queue

