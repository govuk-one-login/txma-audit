package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Base64;

import org.json.JSONObject;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;
import software.amazon.awssdk.services.lambda.model.LambdaException;
import uk.gov.di.txma.audit.utilities.S3SearchHelper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;


public class FirehoseToS3StepDefinitions {
    JSONObject SNSInput;
    JSONObject expectedS3;
    Long timestamp = Instant.now().toEpochMilli();
    Region region = Region.EU_WEST_2;

    /**
     * Checks that the input test data is present, and adds a timestamp to make it unique
     *
     * @param fileName  The name of the file which act as the SNS input from the event-processing account
     */
    @Given("the SNS file {string} is available")
    public void checkSNSInputFileIsAvailable(String fileName) throws IOException {
        JSONObject json = new JSONObject(readJSONFile(fileName));
        SNSInput = addTimestampField(json);
    }

    /**
     * Checks that the test data of what is expected is present. And adds the timestamp to match the input
     *
     * @param fileName  The name of the file which should match the data ending at the S3 buckets
     */
    @And("the expected file {string} is available")
    public void checkExpectedOutputFileIsAvailable(String fileName) throws IOException{
        JSONObject json = new JSONObject(readJSONFile(fileName));
        expectedS3 = addTimestampField(json);
    }

    /**
     * This sends SNS message to firehose
     */
    @When("the message is sent to firehose")
    public void sendMessageToFirehose() {
        String functionName = "txma-audit-dev-tools-add-firehose-record";

        // Opens the lambda client
        try (LambdaClient awsLambda = LambdaClient.builder()
                .region(region)
                .build()){

            JSONObject firehoseLambdaParams = new JSONObject();
            firehoseLambdaParams.put("firehose", "AuditFireHose-" + System.getenv("TEST_ENVIRONMENT"));
            firehoseLambdaParams.put("data", SNSInput);

            // Invoke the lambda with the input data
            SdkBytes payload = SdkBytes.fromUtf8String(firehoseLambdaParams.toString());
            InvokeRequest request = InvokeRequest.builder()
                    .functionName(functionName)
                    .logType("Tail")
                    .payload(payload)
                    .build();
            InvokeResponse invokedResponse = awsLambda.invoke(request);

            // Checks the data is sent, and records the Request ID to track it
            assertEquals(200, invokedResponse.sdkHttpResponse().statusCode(), "A problem calling the lambda. HTTP response was incorrect.");
            String invokedLambdasLog = new String (Base64.getDecoder().decode(invokedResponse.logResult()), StandardCharsets.UTF_8);

            assertFalse(invokedLambdasLog.contains("[ERROR]"), "An error occurred when invoking the Lambda");
        } catch (LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    /**
     * This searches the S3 bucket and checks that the new data contains the output file
     */
    @Then("the audit s3 should have a new event matching the output file")
    public void checkTheObjectInS3IsAsExpected() throws InterruptedException {
        assertTrue(S3SearchHelper.isObjectFoundInS3(expectedS3), "The message was not found in the S3 bucket.");
    }

    /**
     * This adds the current timestamp to the nearest millisecond (if timestamp was already present)
     *
     * @param messageAsJSON      This is the json which is to be changed
     * @return          Returns the amended json
     */
    private JSONObject addTimestampField(JSONObject messageAsJSON){
        // Only adds the new timestamp if it's already in the file
        if (messageAsJSON.has("timestamp")){
            messageAsJSON.put("timestamp", timestamp);
        }
        return messageAsJSON;
    }

    public String readJSONFile(String fileName) throws IOException {
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + fileName + ".json").getAbsolutePath());
        return Files.readString(filePath);
    }
}
