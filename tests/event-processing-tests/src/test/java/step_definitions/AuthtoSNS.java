package step_definitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class AuthtoSNS {
    @Given("a raw data event file <valid data> is available in SQS queue")
    public void aRawDataEventFileValidDataIsAvailableInSQSQueue() {

    }

    @When("lambda receives the raw event data")
    public void lambdaReceivesTheRawEventData() {

    }

    @Then("the event data should have the mandatory fields `timestamp` and {string}")
    public void theEventDataShouldHaveTheMandatoryFieldsTimestampAndEvent_name() {

    }

    @Then("the raw event data is available in the SNS")
    public void theRawEventDataIsAvailableInTheSNS() {

    }
}
