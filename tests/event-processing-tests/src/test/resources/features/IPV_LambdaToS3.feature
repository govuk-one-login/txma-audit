Feature: Raw event data journey from the IPV lambda to S3

  Scenario: Check messages pass through lambda to S3
    Given the SQS file "IPV/LAMBDA_001.json" is available
    And the output file "IPV/CYBER_S3_001.json" is available
    And the output file "IPV/FRAUD_S3_001.json" is available
    And the output file "IPV/PERF_S3_001.json" is available
    When the "IPV" lambda is invoked
    Then there shouldn't be an error message in the "IPV" lambda cloudwatch
    And the "cyber" s3 should have a new event data
    And the event data should match with the "IPV/CYBER_S3_001.json" file
    And the "fraud" s3 should have a new event data
    And the event data should match with the "IPV/FRAUD_S3_001.json" file
    And the "perf" s3 should have a new event data
    And the event data should match with the "IPV/PERF_S3_001.json" file

