@build @dev
Feature: Raw event data journey from the lambda to S3 for build (and dev) environment

  Scenario Outline: Check messages pass through lambda to S3
    Given the SQS file "lambda_through_to_s3" is available for the "<account>" team
    And the output file "s3_expected" is available
      | fraud    |
      | perf     |
    When the "<account>" lambda is invoked
    And the s3 below should have a new event matching the respective "<account>" output file "s3_expected"
      | fraud    |
      | perf     |

    Examples:
    | account     |
    | IPV         |
    | IPVPass     |
    | KBV         |
    | KBVAddress  |
    | KBVFraud    |
    | SPOT        |


  Scenario Outline: Check messages don't pass through lambda if missing event_name
    Given the SQS file "lambda_missing_event_name" is available for the "<account>" team
    When the "<account>" lambda is invoked
    Then there should be a "[ERROR]" message in the "<account>" lambda logs

    Examples:
      | account     |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |

  Scenario Outline: Check messages don't pass through lambda if missing timestamp
    Given the SQS file "lambda_missing_timestamp" is available for the "<account>" team
    When the "<account>" lambda is invoked
    Then there should be a "[ERROR]" message in the "<account>" lambda logs

    Examples:
      | account     |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |

  Scenario Outline: Check messages receive a warning in Cloudwatch if addition fields are present
    Given the SQS file "lambda_additional_field" is available for the "<account>" team
    And the output file "s3_expected" is available
      | fraud    |
    When the "<account>" lambda is invoked
    Then there should be a "[WARN]" message in the "<account>" lambda logs
    And the s3 below should have a new event matching the respective "<account>" output file "s3_expected"
      | fraud    |

    Examples:
      | account     |
      | IPV         |
      | IPVPass     |
      | KBV         |
      | KBVAddress  |
      | KBVFraud    |
      | SPOT        |


  Scenario Outline: Checking the filter sends "AUTH_UPDATE_CLIENT_REQUEST_ERROR" only to Fraud
    Given the SQS file "auth_update_client_request_error" is available for the "<account>" team
    And the output file "expected" is available
      | fraud    |
      | perf     |
    When the "<account>" lambda is invoked
    And the s3 below should have a new event matching the respective "<account>" output file "expected"
      | fraud    |
    And the S3 below should not have a new event matching the respective "<account>" output file "expected"
      | perf     |

    Examples:
      | account     |
      | IPV         |


  Scenario Outline: Checking the filter sends "RANDOM_EVENT" to neither Fraud, nor Performance
    Given the SQS file "random_event" is available for the "<account>" team
    And the output file "expected_random" is available
      | fraud    |
      | perf     |
    When the "<account>" lambda is invoked
    And the S3 below should not have a new event matching the respective "<account>" output file "expected_random"
      | fraud    |
      | perf     |

    Examples:
      | account     |
      | IPV         |

  Scenario Outline: Check APP messages pass through lambda to S3
    Given the SQS file "APP_event_lambda_to_s3" is available for the "<account>" team
    And the output file "APP_event_expected" is available
      | fraud    |
      | perf     |
    When the "<account>" lambda is invoked
    And the s3 below should have a new event matching the respective "<account>" output file "APP_event_expected"
      | fraud    |
      | perf     |

    Examples:
      | account     |
      | App         |
