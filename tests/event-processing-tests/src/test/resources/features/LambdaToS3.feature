Feature: Raw event data journey from the lambda to S3

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


  Scenario Outline: Check messages don't pass through lambda if missing event_name
    Given the SQS file "<account>/LAMBDA_002.json" is available
    When the "<account>" lambda is invoked
    Then there should be an error message in the "<account>" lambda cloudwatch

    Examples:
      | account     |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |

  Scenario Outline: Check messages don't pass through lambda if missing timestamp
    Given the SQS file "<account>/LAMBDA_003.json" is available
    When the "<account>" lambda is invoked
    Then there should be an error message in the "<account>" lambda cloudwatch

    Examples:
      | account     |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |

  Scenario Outline: Check messages receive a warning in Cloudwatch if addition fields are present
    Given the SQS file "<account>/LAMBDA_004.json" is available
    And the "<account>" output file "001" is available
      | FRAUD    |
    When the "<account>" lambda is invoked
    Then there should be a warn message in the "<account>" lambda cloudwatch
    And the s3 below should have a new event matching the respective "<account>" output file "001"
      | FRAUD    |
    And this s3 event should not contain the "additional" field

    Examples:
      | account     |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |