package uk.gov.di.txma.audit.bdd;

import io.cucumber.datatable.DataTable;
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
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
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
import software.amazon.awssdk.services.s3.model.ListObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;

import static java.util.Objects.isNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;


public class FirehoseToS3StepDefinitions {

    String output;
    SdkBytes input;
    String SNSInput;
    JSONObject expectedS3;
    String timestamp;
    JSONObject correctS3;
    Region region = Region.EU_WEST_2;

    /**
     * Checks that the input test data is present, and adds a timestamp to make it unique
     *
     * @param filename  The name of the file which act as the SNS input from the event-processing account
     * @param account   The name of the team which the event if from
     * @throws IOException
     */
    @Given("the SQS file {string} is available for the {string} team")
    public void the_input_file_is_available_for_the_team(String filename, String account) throws IOException {
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);

        JSONObject json = new JSONObject(file);
        SNSInput = addUniqueComponentID(json, account).toString();
    }

    /**
     * Checks that the test data of what is expected is present. And adds the timestamp to match the input
     *
     * @param filename  The name of the file which should match the data ending at the S3 buckets
     * @param account   The name of the team which the event if from
     */
    @And("the expected file {string} is available for the {string} team")
    public void the_expected_file_is_available_for_the_team(String filename, String account) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);

        JSONObject json = new JSONObject(file);
        expectedS3 = addUniqueComponentID(json, account);
    }

    /**
     * This sends SNS message to firehose
     */
    @When("the message is sent to firehose")
    public void the_message_is_sent_to_firehose() {
        String firehoseName = "AuditFireHose-build";

        // Opens a firehose client
        try (FirehoseClient firehoseClient = FirehoseClient.builder()
                .region(region)
                .build()) {

            // Creates a record readable by Firehose
            input = SdkBytes.fromUtf8String(SNSInput);
            Record record = Record.builder()
                    .data(input)
                    .build();

            // Writes to firehose
            PutRecordRequest recordRequest = PutRecordRequest.builder()
                    .deliveryStreamName(firehoseName)
                    .record(record)
                    .build();

            // Checks the response
            PutRecordResponse recordResponse = firehoseClient.putRecord(recordRequest);
            assertEquals(200, recordResponse.sdkHttpResponse().statusCode());
        } catch (FirehoseException e) {
            System.out.println(e.getLocalizedMessage());
            System.exit(1);
        }
    }

    /**
     * This searches the S3 bucket and checks that the new data contains the output file
     */
    @Then("the s3 below should have a new event matching the output file")
    public void the_s3_below_should_have_a_new_event_matching_the_respective_output_file() throws InterruptedException {

        boolean foundInS3 = false;
        // count will make sure it only searches for a finite time
        int count = 0;

        // Reset correctS3 for next endpoint
        correctS3 = null;

        // Has a retry loop in case it finds the wrong key on the first try
        // Count < 11 is enough time for it to be processed by the Firehose
        // If it is the first firehose being checked, it will wait the full time (or until it is found)
        // If it is a later firehose, we know that enough time has already passed, so it only goes through the loop once
        while (!foundInS3 && count < 11) {
            if (count > 0){
                Thread.sleep(10000);
            }
            count ++;

            // Checks for latest key and saves the contents in the output variable
            output = null;
            findLatestKeys();

            // Splits the batched outputs into individual jsons
            List<JSONObject> array = separate(output);


            // Compares all individual jsons with our test data
            for (JSONObject object : array) {
                if (compareOutput(object, expectedS3)) {
                    foundInS3 = true;
                    break;
                }
            }
        }

        assertTrue(foundInS3);
    }

    /**
     * This adds the current timestamp to a component_id for each team to ensure the message is unique
     *
     * @param json      This is the json which the component_id is being amended
     * @param account   This is the account name to be added to the component_id
     * @return          Returns the amended json
     */
    private JSONObject addUniqueComponentID(JSONObject json, String account){
        // Only adds the new component_id if it's already in the file
        if (json.has("component_id")){
            if (timestamp == null){
                timestamp = Instant.now().toString();
            }
            json.put("component_id", account+" "+timestamp);
        }
        return json;
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
     * This compares a message in S3 to the expected S3 output
     *
     * @param S3            The S3 message to be compared
     * @param expectedS3    The expected message
     * @return              True or false depending on if the S3 message contains the expected S3
     */
    private boolean compareOutput(JSONObject S3, JSONObject expectedS3){
        // If not already found
        if (isNull(correctS3)) {
            // This will hold the correct message if all elements match
            correctS3 = S3;

            // Loops through the keys of the expected result
            Iterator<String> keys = expectedS3.keys();
            keys.forEachRemaining(key -> {
                if (!S3.has(key) || !Objects.equals(S3.get(key).toString(), expectedS3.get(key).toString())) {
                    // removes the message if found to not be the right one
                    correctS3 = null;
                }
            });
        }
        return !isNull(correctS3);
    }


    /**
     * Finds the latest 2 keys in the S3 bucket and saves the contents in the output variable
     */
    private void findLatestKeys(){
        String bucketName = "audit-build-message-batch";

        // Opens an S3 client
        try (S3Client s3 = S3Client.builder()
                .region(region)
                .build()){

            // This is used to get the current year, so that we can search the correct s3 files
            ZonedDateTime now = Instant.now().atZone(ZoneOffset.UTC);
            // Lists all objects
            ListObjectsRequest listObjects = ListObjectsRequest
                    .builder()
                    .bucket(bucketName)
                    .build();

            // Finds the latest object
            ListObjectsResponse res = s3.listObjects(listObjects);
            List<S3Object> objects = res.contents();

            // This makes sure that there are at least two logs
            if (objects.size() > 1) {
                // This is the latest keys
                String latestKey = objects.get(objects.size() - 1).key();
                String previousKey = objects.get(objects.size() - 2).key();

                output = "";
                StringBuilder str = new StringBuilder(output);
                for (String key : new String[]{latestKey, previousKey}){
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
                output = str.toString();
            }

        } catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
