#@build @dev @staging
#Feature: IPV event data journey from firehose to S3
#
#  Scenario: Verify the data journey from firehose to S3
#    Given the SNS file "firehose" is available
#    And the expected file "s3_expected" is available
#    When the message is sent to firehose
#    Then the audit s3 should have a new event matching the output file