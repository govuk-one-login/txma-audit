Feature: Raw event data journey from the SPOT lambda to S3

  Scenario: Check messages pass through lambda to S3
    Given the SQS file "SPOT/LAMBDA_001.json" is available
    And the output file "SPOT/CYBER_S3_001.json" is available
    And the output file "SPOT/FRAUD_S3_001.json" is available
    And the output file "SPOT/PERF_S3_001.json" is available
    When the "SPOT" lambda is invoked
    Then there shouldn't be an error message in the "SPOT" lambda cloudwatch
    And the "cyber" s3 should have a new event data
    And the event data should match with the "SPOT/CYBER_S3_001.json" file
    And the "fraud" s3 should have a new event data
    And the event data should match with the "SPOT/FRAUD_S3_001.json" file
    And the "perf" s3 should have a new event data
    And the event data should match with the "SPOT/PERF_S3_001.json" file
