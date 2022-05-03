package step_definitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


import java.nio.file.Files;

public class Auth_SNStoS3 {
    String testData = "{\"event_id\": \"529f-decd-615e-d973\", \"request_id\": \"915b-e4a4-6be2-b8dd\", \"session_id\": \"8cd1b82c\", \"client_id\": \"Orch\", \"timestamp\": 1647968132, \"timestamp_formatted\": \"2022-03-22T16:55:32.882\", \"event_name\": \"IPV_USER_FAILED\", \"persistent_session_id\": \"...\", \"user\": {\"id\": \"12e467e2\", \"email\": \"m.thompson@randatmail.com\", \"phone\": \"33600182839\", \"ip_address\": \"181.246.129.108\"}, \"platform\": {\"xray_trace_id\": \"24727sda4192\"}, \"restricted\": {\"experian_ref\": \"DSJJSEE29392\"}, \"extensions\": {\"response\": \"Authentification successful\"}}";
    @Given("the datafile TxMA_TS_{int} is available")
    public void theDatafileTxMA_TS_IsAvailable(int arg0) {
        System.out.println("testData = " + testData);
    }
    public Auth_SNStoS3() throws JsonProcessingException {
    }
////
////    public void loaddatafile() {
////        // Write code here that turns the phrase above into concrete actions
////        assertTrue(Files.exists(C:\Users\thamp\IdeaProjects\di-txma-audit\tests\event-processing-tests\src\test\resources\Test Data\TxMA_TS_001.json));
////        throw new io.cucumber.java.PendingException();
//    }

    private void assertTrue(boolean exists) {
    }

    @When("the lambda is invoked")
    public void theLambdaIsInvoked() {
    }


}
