Feature: Raw event data journey from the KBV lambda to S3

  Scenario: Check messages pass through lambda to S3
    Given the SQS file "KBV/LAMBDA_001.json" is available
    And the output file "KBV/CYBER_S3_001.json" is available
    And the output file "KBV/FRAUD_S3_001.json" is available
    And the output file "KBV/PERF_S3_001.json" is available
    When the "KBV" lambda is invoked
    Then there shouldn't be an error message in the "KBV" lambda cloudwatch
    And the "cyber" s3 should have a new event data
    And the event data should match with the "KBV/CYBER_S3_001.json" file
    And the "fraud" s3 should have a new event data
    And the event data should match with the "KBV/FRAUD_S3_001.json" file
    And the "perf" s3 should have a new event data
    And the event data should match with the "KBV/PERF_S3_001.json" file

