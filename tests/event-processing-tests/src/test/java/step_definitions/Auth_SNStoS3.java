package step_definitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;

import java.nio.file.Files;

public class Auth_SNStoS3 {
    @Given("the datafile TxMA_TS_001.json is available")
    public void loaddatafile() {
        // Write code here that turns the phrase above into concrete actions
        assertTrue(Files.exists(C:\Users\thamp\IdeaProjects\di-txma-audit\tests\event-processing-tests\src\test\resources\Test Data\TxMA_TS_001.json));
        throw new io.cucumber.java.PendingException();
    }

    private void assertTrue(boolean exists) {
    }

    @When("the lambda is invoked")
    public void theLambdaIsInvoked() {
    }
}
