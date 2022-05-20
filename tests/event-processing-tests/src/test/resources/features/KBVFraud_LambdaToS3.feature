Feature: Raw event data journey from the KBVFRAUD lambda to S3

  Scenario: Check messages pass through lambda to S3
    Given the SQS file "KBVFRAUD/LAMBDA_001.json" is available
    And the output file "KBVFRAUD/CYBER_S3_001.json" is available
    And the output file "KBVFRAUD/FRAUD_S3_001.json" is available
    And the output file "KBVFRAUD/PERF_S3_001.json" is available
    When the "KBVFraud" lambda is invoked
    Then there shouldn't be an error message in the "KBVFraud" lambda cloudwatch
    And the "cyber" s3 should have a new event data
    And the event data should match with the "KBVFRAUD/CYBER_S3_001.json" file
    And the "fraud" s3 should have a new event data
    And the event data should match with the "KBVFRAUD/FRAUD_S3_001.json" file
    And the "perf" s3 should have a new event data
    And the event data should match with the "KBVFRAUD/PERF_S3_001.json" file

