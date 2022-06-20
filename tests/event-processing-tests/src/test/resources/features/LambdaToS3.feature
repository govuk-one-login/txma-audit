Feature: Raw event data journey from the lambda to S3

  Scenario Outline: Check messages pass through lambda to S3
    Given the SQS file "LAMBDA_THROUGH_TO_S3.json" is available for the "<account>" team
    And the output file is available
      | FRAUD    |
      | PERF     |
    When the "<account>" lambda is invoked
    Then there shouldn't be an error message in the "<account>" lambda cloudwatch
    And the s3 below should have a new event matching the respective "<account>" output file
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
    Given the SQS file "LAMBDA_MISSING_EVENT_NAME.json" is available for the "<account>" team
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
    Given the SQS file "LAMBDA_MISSING_TIMESTAMP.json" is available for the "<account>" team
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
    Given the SQS file "LAMBDA_ADDITIONAL_FIELD.json" is available for the "<account>" team
    And the output file is available
      | FRAUD    |
    When the "<account>" lambda is invoked
    Then there should be a warn message in the "<account>" lambda cloudwatch
    And the s3 below should have a new event matching the respective "<account>" output file
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