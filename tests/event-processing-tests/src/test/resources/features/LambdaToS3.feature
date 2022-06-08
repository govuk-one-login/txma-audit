Feature: Raw event data journey from the IPV lambda to S3

  Scenario Outline: Check messages pass through lambda to S3
    Given the SQS file "<account>/LAMBDA_001.json" is available
    And the "<account>" output file "001" is available
      | FRAUD    |
      | PERF     |
    When the "<account>" lambda is invoked
    Then there shouldn't be an error message in the "<account>" lambda cloudwatch
    And the s3 below should have a new event matching the respective "<account>" output file "001"
      | FRAUD    |
      | PERF     |

    Examples:
    | account     |
    | IPV         |
    | IPVPass     |
    | KBV         |
    | KBVAddress  |
    | KBVFraud    |
    | SPOT        |

