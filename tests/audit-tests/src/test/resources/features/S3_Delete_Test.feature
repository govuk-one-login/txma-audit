Feature: Test to prove that an S3 object cannot be deleted

#  @build

  Scenario: Verify that an S3 object cannot be deleted
    Given there is an object in S3 bucket
    When the user tries to delete the first object
    Then the user should not be allowed to do so
