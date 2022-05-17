Feature: Sample event processor feature

  Scenario: Verify the message is removed from the queue after successful processing
    Given The Message Service is running
    And I have a subscription to the EP SNS
    When the EventProcessor Lambda is invoked
    Then the event is available from my subscription


