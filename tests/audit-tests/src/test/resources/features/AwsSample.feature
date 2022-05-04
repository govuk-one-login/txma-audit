Feature: Sample event processor feature

  Scenario: Verify the message is removed from the queue after successful processing
    Given I have a subscription to the EP SNS
    When the EventProcessor Lambda is invoked
    Then the event is available from my subscription


