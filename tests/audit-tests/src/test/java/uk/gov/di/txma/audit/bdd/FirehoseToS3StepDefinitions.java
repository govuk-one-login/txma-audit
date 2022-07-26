package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;
import java.util.zip.GZIPInputStream;

import org.json.JSONObject;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.firehose.FirehoseClient;
import software.amazon.awssdk.services.firehose.model.FirehoseException;
import software.amazon.awssdk.services.firehose.model.PutRecordRequest;
import software.amazon.awssdk.services.firehose.model.PutRecordResponse;
import software.amazon.awssdk.services.firehose.model.Record;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;


public class FirehoseToS3StepDefinitions {
    String output;
    String SNSInput;
    JSONObject expectedS3;
    Long timestamp = Instant.now().toEpochMilli();
    Region region = Region.EU_WEST_2;

    /**
     * Checks that the input test data is present, and adds a timestamp to make it unique
     *
     * @param fileName  The name of the file which act as the SNS input from the event-processing account
     * @throws IOException
     */
    @Given("the SNS file {string} is available")
    public void checkSNSInputFileIsAvailable(String fileName) throws IOException {
        JSONObject json = new JSONObject(readJSONFile(fileName));
        SNSInput = addTimestampField(json).toString();
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
        String firehoseName = "AuditFireHose-" + System.getenv("TEST_ENVIRONMENT");

        // Opens a firehose client
        try (FirehoseClient firehoseClient = FirehoseClient.builder()
                .region(region)
                .build()) {

            // Creates a record readable by Firehose
            SdkBytes input = SdkBytes.fromUtf8String(SNSInput);
            Record record = Record.builder()
                    .data(input)
                    .build();

            // Writes to firehose
            PutRecordRequest recordRequest = PutRecordRequest.builder()
                    .deliveryStreamName(firehoseName)
                    .record(record)
                    .build();

            // Checks the response
            PutRecordResponse firehoseRecordResponse = firehoseClient.putRecord(recordRequest);
            assertEquals(200, firehoseRecordResponse.sdkHttpResponse().statusCode(), "A problem calling the lambda. HTTP response was incorrect.");
        } catch (FirehoseException e) {
            System.out.println(e.getLocalizedMessage());
            System.exit(1);
        }
    }

    /**
     * This searches the S3 bucket and checks that the new data contains the output file
     */
    @Then("the s3 below should have a new event matching the output file")
    public void checkTheObjectInS3IsAsExpected() throws InterruptedException {
        assertTrue(isFoundInS3(), "The message was not found in the S3 bucket.");
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

    /**
     * This separates the batched jsons into a json array
     *
     * @param input The batched jsons
     * @return      The array of jsons
     */
    private List<JSONObject> separate(String input){
        List<JSONObject> output = new ArrayList<>();
        for (int index = 0; index < input.length(); ) {
            if (input.charAt(index) == '{') {
                int close = findBracket(input, index);
                output.add(new JSONObject(input.substring(index, close + 1)));
                index = close + 1;
            } else {
                index++;
            }
        }
        return output;
    }

    /**
     * This find where the corresponding `}` bracket is for the current json
     *
     * @param input The batch of jsons to be separated
     * @param start The index of the opening `{` for the current within the batched jsons
     * @return      The index of the corresponding `}` bracket
     */
    private static int findBracket(String input, int start) {
        Stack<Integer> stack = new Stack<>();
        for (int index = start; index < input.length(); index++) {
            if (input.charAt(index) == '{') {
                stack.push(index);
            } else if (input.charAt(index) == '}') {
                stack.pop();
                if (stack.isEmpty()) {
                    return index;
                }
            }
        }
        return 0;
    }


    /**
     * Finds the latest 2 keys in the S3 bucket and saves the contents in the output variable
     */
    private void findLatestKeysFromAuditS3(){
        String bucketName = "audit-" + System.getenv("TEST_ENVIRONMENT") + "-message-batch";

        // The list of the latest two keys
        List<String> keys = new ArrayList<>();

        // Opens an S3 client
        try (S3Client s3 = S3Client.builder()
                .region(region)
                .build()){

            // Lists 1000 objects
            ListObjectsV2Request listObjects = ListObjectsV2Request
                    .builder()
                    .bucket(bucketName)
                    .build();
            ListObjectsV2Response res = s3.listObjectsV2(listObjects);
            List<S3Object> objects = res.contents();

            // If no objects were found, returns nothing
            if (res.keyCount()==0){
                return;
            }

            // Stores the most recent two keys
            keys.add(objects.get(objects.size() - 1).key());
            if (res.keyCount() > 1){
                keys.add(objects.get(objects.size() - 2).key());
            }

            // If more than 1000 objects, cycles through the rest
            while (res.isTruncated()){
                // Gets the next batch
                listObjects = ListObjectsV2Request
                        .builder()
                        .bucket(bucketName)
                        .continuationToken(res.nextContinuationToken())
                        .build();

                // Stores the batch
                res = s3.listObjectsV2(listObjects);
                objects = res.contents();

                // If there's more than one object, we store the most recent two keys
                // If there is only one object, we keep the latest key from the previous batch,
                // and store the most recent from this one
                if (res.keyCount() > 1){
                    keys.set(0, objects.get(objects.size() - 1).key());
                    keys.set(1, objects.get(objects.size() - 2).key());
                } else {
                    keys.set(1, objects.get(0).key());
                }
            }

            output = "";
            StringBuilder str = new StringBuilder(output);
            // Loops through the latest two keys
            for (String key : keys){
                // Gets the new object
                GetObjectRequest objectRequest = GetObjectRequest
                        .builder()
                        .key(key)
                        .bucket(bucketName)
                        .build();

                // Reads the new object
                GZIPInputStream gzinpstr = new GZIPInputStream(s3.getObject(objectRequest));
                InputStreamReader inpstr = new InputStreamReader(gzinpstr);
                BufferedReader read = new BufferedReader(inpstr);
                str.append(read.readLine());
            }
            // Stores the messages in output
            output = str.toString();

        } catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String readJSONFile(String fileName) throws IOException {
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + fileName + ".json").getAbsolutePath());
        return Files.readString(filePath);
    }

    public boolean isFoundInS3() throws InterruptedException {
        // count will make sure it only searches for a finite time
        int count = 0;

        // Has a retry loop in case it finds the wrong key on the first try
        // Count < 11 is enough time for it to be processed by the Firehose
        while (count < 11) {
            // Checks for latest key and saves the contents in the output variable
            output = null;
            findLatestKeysFromAuditS3();

            // If an object was found
            if (output != null) {
                // Splits the batched outputs into individual jsons
                List<JSONObject> array = separate(output);

                // Compares all individual jsons with our test data
                for (JSONObject object : array) {
                    if (object.similar(expectedS3)) {
                        return true;
                    }
                }
            }

            Thread.sleep(10000);
            count ++;
        }
        return false;
    }
}
