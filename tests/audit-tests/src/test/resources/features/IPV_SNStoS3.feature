Feature: Auth event data journey from SNS to Firehose

  Scenario: Verify the data journey from SNS to S3
    Given the input file "IPV_SNS_001.json" is available
    And the expected file "IPV_S3_001.json" is available
    And we can read all current S3 keys
    When the message is sent to firehose
    Then the s3 should have a new event data
    And the event data should match with the S3 file