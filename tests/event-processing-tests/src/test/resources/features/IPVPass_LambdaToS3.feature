Feature: Raw event data journey from the IPVPASS lambda to S3

  Scenario: Check messages pass through lambda to S3
    Given the SQS file "IPVPASS/LAMBDA_001.json" is available
    And the output file "IPVPASS/CYBER_S3_001.json" is available
    And the output file "IPVPASS/FRAUD_S3_001.json" is available
    And the output file "IPVPASS/PERF_S3_001.json" is available
    When the "IPVPass" lambda is invoked
    Then there shouldn't be an error message in the "IPVPass" lambda cloudwatch
    And the "cyber" s3 should have a new event data
    And the event data should match with the "IPVPASS/CYBER_S3_001.json" file
    And the "fraud" s3 should have a new event data
    And the event data should match with the "IPVPASS/FRAUD_S3_001.json" file
    And the "perf" s3 should have a new event data
    And the event data should match with the "IPVPASS/PERF_S3_001.json" file

