@build @dev
Feature: Raw event data journey from the lambda to S3 for build (and dev) environment

  Scenario Outline: Check messages pass through lambda to S3
    Given the SQS file "lambda_through_to_s3" is available in the "<account>" folder
    And the output file "s3_expected" in the "<account>" folder is available
      | fraud    |
      | perf     |
    When the "<account>" lambda is invoked
    Then the s3 below should have a new event matching the output file "s3_expected" in the "<account>" folder
      | fraud    |
      | perf     |

    Examples:
    | account     |
    | App         |
    | IPV         |
    | IPVPass     |
    | KBV         |
    | KBVAddress  |
    | KBVFraud    |
    | SPOT        |


  Scenario Outline: Check messages don't pass through lambda if missing event_name
    Given the SQS file "lambdaToCloudwatchTests/lambda_missing_event_name" is available for the "<account>" team
    When the "<account>" lambda is invoked
    Then there should be a "[ERROR]" message in the "<account>" lambda logs

    Examples:
      | account     |
      | App         |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |

  Scenario Outline: Check messages don't pass through lambda if missing timestamp
    Given the SQS file "lambdaToCloudwatchTests/lambda_missing_timestamp" is available for the "<account>" team
    When the "<account>" lambda is invoked
    Then there should be a "[ERROR]" message in the "<account>" lambda logs

    Examples:
      | account     |
      | App         |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |

  Scenario Outline: Check messages receive a warning in Cloudwatch if addition fields are present
    Given the SQS file "lambdaToCloudwatchTests/lambda_additional_field" is available for the "<account>" team
    And the output file "s3_expected" in the "lambdaToCloudwatchTests" folder is available
      | fraud    |
    When the "<account>" lambda is invoked
    Then there should be a "[WARN]" message in the "<account>" lambda logs
    And the s3 below should have a new event matching the respective "<account>" output file "s3_expected" in the "lambdaToCloudwatchTests" folder
      | fraud    |

    Examples:
      | account     |
      | App         |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |


  Scenario Outline: Checking the filter sends "AUTH_UPDATE_CLIENT_REQUEST_ERROR" only to Fraud
    Given the SQS file "SNSFilterTests/auth_update_client_request_error" is available for the "<account>" team
    And the output file "expected" in the "SNSFilterTests" folder is available
      | fraud    |
      | perf     |
    When the "<account>" lambda is invoked
    Then the s3 below should have a new event matching the respective "<account>" output file "expected" in the "SNSFilterTests" folder
      | fraud    |
    And the S3 below should not have a new event matching the respective "<account>" output file "expected" in the "SNSFilterTests" folder
      | perf     |

    Examples:
      | account     |
      | IPV         |


  Scenario Outline: Checking the filter sends "RANDOM_EVENT" to neither Fraud, nor Performance
    Given the SQS file "SNSFilterTests/random_event" is available for the "<account>" team
    And the output file "expected_random" in the "SNSFilterTests" folder is available
      | fraud    |
      | perf     |
    When the "<account>" lambda is invoked
    Then the S3 below should not have a new event matching the respective "<account>" output file "expected_random" in the "SNSFilterTests" folder
      | fraud    |
      | perf     |

    Examples:
      | account     |
      | IPV         |
