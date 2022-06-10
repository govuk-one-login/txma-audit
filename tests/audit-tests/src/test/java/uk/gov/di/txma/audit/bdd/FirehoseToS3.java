package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.zip.GZIPInputStream;

import org.json.JSONArray;
import org.json.JSONObject;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.firehose.FirehoseClient;
import software.amazon.awssdk.services.firehose.model.FirehoseException;
import software.amazon.awssdk.services.firehose.model.PutRecordRequest;
import software.amazon.awssdk.services.firehose.model.PutRecordResponse;
import software.amazon.awssdk.services.firehose.model.Record;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import static org.junit.jupiter.api.Assertions.*;


public class FirehoseToS3 {

    String output;
    SdkBytes input;
    String SNSInput;
    JSONObject expectedS3;
    Instant time = Instant.now();
    String timestamp;

    /**
     * Checks that the input test data is present, and adds a timestamp to make it unique
     *
     * @param filename  The name of the file which act as the SNS input from the event-processing account
     * @param account   The name of the team which the event if from
     * @throws IOException
     */
    @Given("the SQS file {string} is available for the {string} team")
    public void the_input_file_is_available_for_the_team(String filename, String account) throws IOException{
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
        Region region = Region.EU_WEST_2;

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
     * Checks the S3 bucket until a new message is found
     *
     * @throws InterruptedException
     */
    @Then("the s3 should have a new event data")
    public void the_s3_should_have_a_new_event_data() throws InterruptedException {
        String newkey = null;
        String bucketName = "audit-build-message-batch";
        // This ensures that the test will eventually fail, even if a new message is not found
        int timer = 0;

        Region region = Region.EU_WEST_2;

        while (timer < 20 && newkey == null){
            timer ++;
            // Gives the message time to pass through Firehose
            Thread.sleep(65000);

            // Opens an S3 client
            try (S3Client s3 = S3Client.builder()
                    .region(region)
                    .build()){

                // Lists all objects
                ListObjectsRequest listObjects = ListObjectsRequest
                        .builder()
                        .bucket(bucketName)
                        .build();

                // Finds the latest object
                ListObjectsResponse res = s3.listObjects(listObjects);
                List<S3Object> objects = res.contents();
                S3Object latest = objects.get(objects.size() - 1);

                // Checks it has been created past the time the test started and stored the corresponding key
                if (latest.lastModified().compareTo(time)>0){
                    newkey = latest.key();
                }

            } catch (S3Exception e) {
                System.err.println(e.awsErrorDetails().errorMessage());
                System.exit(1);
            }
        }

        // Checks a new key was found
        assertNotNull(newkey);

        // Opens S3 client
        try (S3Client s3 = S3Client.builder()
                .region(region)
                .build()){

            // Gets the new object
            GetObjectRequest objectRequest = GetObjectRequest
                    .builder()
                    .key(newkey)
                    .bucket(bucketName)
                    .build();

            // Reads the new object
            GZIPInputStream gzinpstr = new GZIPInputStream(s3.getObject(objectRequest));
            InputStreamReader inpstr = new InputStreamReader(gzinpstr);
            BufferedReader read = new BufferedReader(inpstr);
            output = read.readLine();

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Compares the new object to the test data
     */
    @And("the event data should match with the S3 file")
    public void the_event_data_should_match_with_the_S3_file() {
        // Splits the batched outputs into individual jsons
        List<JSONObject> array = separate(output);

        // Compares all individual jsons with our test data
        boolean foundInS3 = false;
        for (JSONObject object: array){
            if (compareOutput(object, expectedS3)){
                foundInS3 = true;
                break;
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

        // Loops through the keys of the expected result
        Iterator<String> keys = expectedS3.keys();
        while(keys.hasNext()) {
            String key = keys.next();

            // Returns false if not present, or doesn't match the value
            if (S3.has(key)){
                if (!Objects.equals(S3.get(key).toString(), expectedS3.get(key).toString())){
                    return false;
                }
            }
            else {
                return false;
            }
        }

        return true;
    }
}
