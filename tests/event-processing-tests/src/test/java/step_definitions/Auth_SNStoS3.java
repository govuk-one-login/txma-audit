import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class Auth_SNStoS3 {
    @io.cucumber.java.en.Given("^the datafile <auth data file> is available in the SNS queue$")
    public void theDatafileAuthDataFileIsAvailableInTheSNSQueue() {
    }

    @When("the firehose pulls the event data")
    public void theFirehosePullsTheEventData() {

    }

    @Then("the s{int} should have a new event data")
    public void theSShouldHaveANewEventData(int arg0) {

    }

    @And("the event data should match with the expected data file <>")
    public void theEventDataShouldMatchWithTheExpectedDataFile() {

    }
}
