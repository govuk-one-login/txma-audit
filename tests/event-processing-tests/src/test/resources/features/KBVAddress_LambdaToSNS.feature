Feature: Raw event data journey from the KBVADDRESS lambda to S3

  Scenario: Check messages pass through lambda to S3
    Given the SQS file "KBVADDRESS/LAMBDA_001.json" is available
    And the output file "KBVADDRESS/CYBER_S3_001.json" is available
    And the output file "KBVADDRESS/FRAUD_S3_001.json" is available
    And the output file "KBVADDRESS/PERF_S3_001.json" is available
    When the "KBVAddress" lambda is invoked
    Then there shouldn't be an error message in the "KBVAddress" lambda cloudwatch
    And the "cyber" s3 should have a new event data
    And the event data should match with the "KBVADDRESS/CYBER_S3_001.json" file
    And the "fraud" s3 should have a new event data
    And the event data should match with the "KBVADDRESS/FRAUD_S3_001.json" file
    And the "perf" s3 should have a new event data
    And the event data should match with the "KBVADDRESS/PERF_S3_001.json" file

