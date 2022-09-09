Feature: Hello world
  @staging
  Scenario: Check a successful address journey from Passport CRI is logged into TxMA
    Given user is on Passport CRI staging
    When user completes address journey successfully
    Then the audit event should appear in TxMA