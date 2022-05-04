Feature: IPV event data journey from SNS to S3

  Scenario: Verify the data journey from SNS to S3
    Given the datafile <IPV data file> is available in the SNS queue
    When the firehose pulls the event data
    Then the s3 should have a new event data
    And the event data should match with the expected data file <>


