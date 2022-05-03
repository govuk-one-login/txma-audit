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

package uk.gov.di.txma.eventprocessor.bdd;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import com.google.gson.JsonParser;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.core.SdkBytes;

import software.amazon.awssdk.services.firehose.FirehoseClient;
import software.amazon.awssdk.services.firehose.model.FirehoseException;
import software.amazon.awssdk.services.firehose.model.PutRecordRequest;
import software.amazon.awssdk.services.firehose.model.Record;
import software.amazon.awssdk.services.firehose.model.PutRecordResponse;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;


public class Auth_SNStoS3 {

    private static final String firehoseName = "arn:aws:firehose:eu-west-2:761029721660:deliverystream/AuditFireHose-build"; //Need to check firehose name and full arn
    private static S3Client s3;
    private static final String bucketName = "arn:aws:s3:eu-west-2:761029721660:audit-resources-build-messagebatchbucket-1vpvbe3ndfd6s"; //Need to check bucket name and full arn
    SdkBytes output;
    SdkBytes input;
    String json;

    @Given("^the datafile {string} is available")
    public void loaddatafile(String fileName) {
        String path = new File("src/test/resources/Test Data/" + fileName).getAbsolutePath();

        JSONParser jsonParser = new JSONParser();

        try (FileReader reader = new FileReader(path))
        {
            //Read JSON file
            input = jsonParser.readValueAsTree().toString(reader);

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }

    @When("^the lambda is invoked")
    public void theLambdaIsInvoked() {
        Region region = Region.EU_WEST_2;
        FirehoseClient firehoseClient = FirehoseClient.builder()
                .region(region)
                .build();

        try {

            input = SdkBytes.fromByteArray(json);

            Record record = Record.builder()
                    .data(sdkBytes)
                    .build();

            PutRecordRequest recordRequest = PutRecordRequest.builder()
                    .deliveryStreamName(streamName)
                    .record(record)
                    .build();

            PutRecordResponse recordResponse = firehoseClient.putRecord(recordRequest) ;
            System.out.println("The record ID is "+recordResponse.recordId());

        } catch (FirehoseException e) {
            System.out.println(e.getLocalizedMessage());
            System.exit(1);
        }

        firehoseClient.close();
    }

    @Then("^the s3 should have a new event data")
    public void theS3ShouldHaveANewEventData() {
        Region region = Region.EU_WEST_2;
        s3 = S3Client.builder()
                .region(region)
                .build();

        String key = "test"; //Need key name. This will depend on how the bucket's set up

        GetObjectRequest getObjectRequest = GetObjectRequest.builder() //I feel like you don't need the above code, but region should be below?
            .bucket(bucketName)
            .key(key)
            .build();

        try {
            GetObjectRequest objectRequest = GetObjectRequest
                    .builder()
                    .key(keyName)
                    .bucket(bucketName)
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3.getObjectAsBytes(objectRequest);
            byte[] data = objectBytes.asByteArray();
            output = SdkBytes.fromByteArray(data);

        } catch (IOException ex) {
            ex.printStackTrace();
        } catch (S3Exception e) {
          System.err.println(e.awsErrorDetails().errorMessage());
           System.exit(1);
        }

        //We need to decide if we want to delete the object after the test, or just leave the test in the S3 bucket
    }

    @And("^the event data should match with the expected data file <>")
    public void theEventDataShouldMatchWithTheExpectedDataFile() {
        if (input == output) {
            System.out.println("SNS to S3 success");
        } else {
            System.out.println("File has changed when saving");
            System.exit(1);
        }
    }

}
