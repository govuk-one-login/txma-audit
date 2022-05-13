Feature: Raw event data journey from SPOT to SNS

  Scenario: Check messages pass through lambda to SNS
    Given the Message Service is running
    And the SQS file "SPOT_LAMBDA_001.json" is available
    And the output file "SNS_001.json" is available
    And I have a subscription to the EP SNS
    When the "SPOT" lambda is invoked
    Then the event is available from my subscription
    And this event is equal to the output file
