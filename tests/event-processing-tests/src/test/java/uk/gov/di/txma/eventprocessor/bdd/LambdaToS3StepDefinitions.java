package uk.gov.di.txma.eventprocessor.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.cucumber.datatable.DataTable;
import org.json.JSONArray;
import org.json.JSONObject;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;
import software.amazon.awssdk.services.lambda.model.LambdaException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;


import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Iterator;
import java.util.List;
import java.util.Stack;
import java.util.zip.GZIPInputStream;
import java.util.Objects;

import static java.util.Objects.isNull;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.core.IsNot.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LambdaToS3StepDefinitions {
    Region region = Region.EU_WEST_2;
    String output = null;
    String input;
    String timestamp;
    JSONObject correctS3;
    String log;

    /**
     * Checks that the input test data is present. And changes it to look like an SQS message
     *
     * @param filename      The name of the file which act as the SQS input from the service teams' accounts
     * @param account       The name of the team which the event if from
     * @throws IOException
     */
    @Given("the SQS file {string} is available for the {string} team")
    public void the_SQS_file_is_available_for_the_team(String filename, String account) throws IOException {
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);

        JSONObject json = new JSONObject(file);
        JSONObject change = addUniqueComponentID(json, account);
        input = wrapJSON(change);
    }

    /**
     * Checks the expected S3 output file is present
     *
     * @param endpoints     The endpoints we're checking against
     * @throws IOException
     */
    @And("the output file {string} is available")
    public void the_output_file_is_available(String filename,DataTable endpoints) throws IOException{
        // Loops through the possible endpoints
        List<List<String>> data = endpoints.asLists(String.class);
        for (List<String> endpoint : data) {
            Path filePath = Path.of(new File("src/test/resources/Test Data/" + endpoint.get(0) + filename+".json").getAbsolutePath());
            Files.readString(filePath);
        }
    }

    /**
     * Invokes the initial lambda to start the data flow
     *
     * @param account   The service team account name for their corresponding lambda
     */
    @When("the {string} lambda is invoked")
    public void the_lambda_is_invoked(String account) {
        String functionName = "EventProcessorFunction-" + account;
        InvokeResponse res;

        // Opens the lambda client
        try (LambdaClient awsLambda = LambdaClient.builder()
                .region(region)
                .build()){

            // Invoke the lambda with the input data
            SdkBytes payload = SdkBytes.fromUtf8String(input);
            InvokeRequest request = InvokeRequest.builder()
                    .functionName(functionName)
                    .logType("Tail")
                    .payload(payload)
                    .build();

            // Checks the data is sent, and records the Request ID to track it
            res = awsLambda.invoke(request);
            assertEquals(200, res.sdkHttpResponse().statusCode());
            log = new String (Base64.getDecoder().decode(res.logResult()), StandardCharsets.UTF_8);


        } catch (LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    /**
     * Ensures that an error does not appear in cloudwatch log produced when the lambda was invoked
     */
    @Then("there shouldn't be an error message in the lambda logs")
    public void there_shouldnt_be_an_error_message_in_the_lambda_cloudwatch() {
        assertThat(log, not(containsString("[ERROR]")));
    }

    /**
     * Ensures that an error does appear in cloudwatch log produced when the lambda was invoked
     */
    @Then("there should be an error message in the lambda logs")
    public void there_should_be_an_error_message_in_the_lambda_cloudwatch() {
        assertThat(log, containsString("[ERROR]"));
    }

    /**
     * Ensures that a warn error does appear in cloudwatch log produced when the lambda was invoked
     */
    @Then("there should be a warn message in the lambda logs")
    public void there_should_be_a_warn_message_in_the_lambda_cloudwatch() {
        assertThat(log, not(containsString("[ERROR]")));
        assertThat(log, containsString("[WARN]"));
    }

    /**
     * This searches the S3 bucket and checks that the new data contains the output file
     *
     * @param account       Which account inputted the message
     * @param endpoints     The endpoints we're checking against
     * @throws IOException
     */
    @And("the s3 below should have a new event matching the respective {string} output file {string}")
    public void the_s3_below_should_have_a_new_event_matching_the_respective_output_file(String account, String filename, DataTable endpoints) throws IOException, InterruptedException {

        // Loops through the possible endpoints
        List<List<String>> data = endpoints.asLists(String.class);
        for (List<String> endpoint : data) {
            boolean foundInS3 = false;
            // count will make sure it only searches for a finite time
            int count = 0;

            // Reset correctS3 for next endpoint
            correctS3 = null;

            // Has a retry loop in case it finds the wrong key on the first try
            // Count < 11 is enough time for it to be processed by the Firehose
            // If it is the first firehose being checked, it will wait the full time (or until it is found)
            // If it is a later firehose, we know that enough time has already passed, so it only goes through the loop once
            while (!foundInS3 && ((count < 11  && endpoint == data.get(0)) || (count < 1))) {
                if (count > 0){
                    Thread.sleep(10000);
                }
                count ++;

                // Checks for latest key and saves the contents in the output variable
                output = null;
                findLatestKeys(endpoint.get(0).toLowerCase());

                // Splits the batched outputs into individual jsons
                List<JSONObject> array = separate(output);

                // Takes the input file, and adds a timestamp to the component_id
                Path filePath = Path.of(new File("src/test/resources/Test Data/" + endpoint.get(0) + filename+".json").getAbsolutePath());
                String file = Files.readString(filePath);
                JSONObject json = new JSONObject(file);
                JSONObject expectedS3 = addUniqueComponentID(json, account);

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

    }

    /**
     * This checks that any additional fields are not in the S3 message found
     *
     * @param field     The name of the field which shouldn't be present
     */
    @And("this s3 event should not contain the {string} field")
    public void the_s3_below_should_have_a_new_event_matching_the_respective_output_files(String field) {
        assertFalse(correctS3.has(field));
    }

    /**
     * Wraps the input json to look like an SQS message
     *
     * @param json  The json to be wrapped
     * @return      The wrapped json
     */
    private String wrapJSON(JSONObject json){
        JSONObject record = new JSONObject();
        record.put("messageId", "059f36b4-87a3-44ab-83d2-661975830a7d");

        record.put("body", json.toString());

        JSONArray array = new JSONArray();
        array.put(record);

        JSONObject wrapped = new JSONObject();
        wrapped.put("Records", array);

        return wrapped.toString();
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
            json.put("component_id", account + " " + timestamp);
        }
        return json;
    }

    /**
     * Finds the latest 2 keys in the S3 bucket and saves the contents in the output variable
     *
     * @param endpoint  What S3 bucket to look at
     */
    private void findLatestKeys(String endpoint){
        String bucketName = "event-processing-build-"+endpoint+"-splunk-test";

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
                    .prefix("firehose/"+now.getYear()+"/")
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

    @And("the  S3 below should not have a new event matching the respective {string} output file {string}")
    public void the_s3_below_should_not_have_a_new_event_matching_the_respective_output_file(String account,String filename, DataTable endpoints) throws IOException {
        // Loops through the possible outputs
        List<List<String>> data = endpoints.asLists(String.class);
        for (List<String> endpoint : data) {
            output = null;

            // Checks for a new key
            checkForNewKey(endpoint.get(0).toLowerCase());

            if (output !=null) {


                // Takes the input file, and adds a timestamp to the component_id
                Path filePath = Path.of(new File("src/test/resources/Test Data/" + endpoint.get(0) + filename+".json").getAbsolutePath());
                String file = Files.readString(filePath);
                JSONObject json = new JSONObject(file);
                JSONObject expectedS3 = addUniqueComponentID(json, account);

                // Splits the batched outputs into individual jsons
                List<JSONObject> array = separate(output);

                // Compares all individual jsons with our test data
                boolean foundInS3 = false;
                for (JSONObject object : array) {
                    if (compareOutput(object, expectedS3)) {
                        foundInS3 = true;
                        break;
                    }
                }

                assertFalse(foundInS3);
            }
        }

    }

    }

