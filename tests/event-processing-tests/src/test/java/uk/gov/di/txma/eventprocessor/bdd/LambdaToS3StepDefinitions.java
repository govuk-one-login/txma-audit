package uk.gov.di.txma.eventprocessor.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.json.JSONArray;
import org.json.JSONObject;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatch.model.CloudWatchException;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.cloudwatchlogs.model.*;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;
import software.amazon.awssdk.services.lambda.model.LambdaException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Stack;
import java.util.zip.GZIPInputStream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;


public class LambdaToS3StepDefinitions {
    Region region = Region.EU_WEST_2;
    String output;
    String input;
    Instant time = Instant.now();
    String requestid;
    String timestamp;

    /**
     * Checks that the input test data is present. And changes it to look like an SQS message
     *
     * @param filename  The name of the file which act as the SQS input from the service teams' accounts
     * @throws IOException
     */
    @Given("the SQS file {string} is available")
    public void the_SQS_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);

        JSONObject json = new JSONObject(file);
        JSONObject change = addTimestamp(json);
        input = wrapJSON(change);
    }

    /**
     * Checks the expected S3 output file is present
     *
     * @param filename      The name of the file which should match the S3 data at the end of the test
     * @throws IOException
     */
    @And("the output file {string} is available")
    public void the_output_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        Files.readString(filePath);
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
                    .invocationType("Event")
                    .payload(payload)
                    .build();

            // Checks the data is sent, and records the Request ID to track it
            res = awsLambda.invoke(request);
            assertEquals(202, res.sdkHttpResponse().statusCode());
            requestid = res.responseMetadata().requestId();

        } catch (LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }

    }

    /**
     * Ensures that an error does not appear in cloudwatch when the lambda was invoked
     *
     * @param account               The service team account name for the corresponding lamdbda
     * @throws InterruptedException
     */
    @Then("there shouldn't be an error message in the {string} lambda cloudwatch")
    public void there_shouldnt_be_an_error_message_in_the_lambda_cloudwatch(String account) throws InterruptedException {

        String logGroupName = "/aws/lambda/EventProcessorFunction-" + account;
        // noEvent ensures we wait for cloudwatch to be updated
        boolean noEvent = true;
        Region region = Region.EU_WEST_2;

        // Opens the cloudwatch client
        try (CloudWatchLogsClient cloudWatchLogsClient = CloudWatchLogsClient.builder()
                .region(region)
                .build()){
            while (noEvent){
                // Gives the cloudwatch time to update
                Thread.sleep(2000);

                // Finds the latest messages in cloudwatch
                DescribeLogStreamsRequest req = DescribeLogStreamsRequest.builder().logGroupName(logGroupName).orderBy("LastEventTime").descending(true).build();
                DescribeLogStreamsResponse res2 = cloudWatchLogsClient.describeLogStreams(req);
                String logStreamName = res2.logStreams().get(0).logStreamName();

                // Get the messages from the latest batch of cloudwatch messages
                GetLogEventsRequest getLogEventsRequest = GetLogEventsRequest.builder()
                        .logGroupName(logGroupName)
                        .logStreamName(logStreamName)
                        .startFromHead(false)
                        .build();

                // Checks the logs don't contain an 'ERROR'
                for (OutputLogEvent event : cloudWatchLogsClient.getLogEvents(getLogEventsRequest).events()){
                    String message = event.message();
                    if (message.contains(requestid)){
                        assertThat(message, not(containsString("ERROR")));
                        noEvent = false;
                    }
                }
            }
        } catch (CloudWatchException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
    }

    /**
     * Checks the S3 bucket until a new message is found
     *
     * @param endpoint              Which of the three S3 buckets we will check
     * @throws InterruptedException
     */
    @And("the {string} s3 should have a new event data")
    public void the_s3_should_have_a_new_event_data(String endpoint) throws InterruptedException {
        String newkey = null;
        String bucketName = "event-processing-build-"+endpoint+"-splunk-test";
        // This ensures that the test will eventually fail, even if a new message is not found
        int timer = 0;

        Region region = Region.EU_WEST_2;

        while (timer < 20 && newkey == null){
            timer ++;
            // Gives the message time to pass through Firehose
            Thread.sleep(30000);

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
     * Converts the test data to add the timestamp, and compares this to the new object
     *
     * @param filename      The name of the file which should match the S3 data at the end of the test
     * @throws IOException
     */
    @And("the event data should match with the {string} file")
    public void the_event_data_should_match_with_the_file(String filename) throws IOException {
        // Takes the input file, and adds a timestamp to the event_name
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);
        JSONObject json = new JSONObject(file);
        JSONObject expectedS3 = addTimestamp(json);

        // Splits the batched outputs into individual jsons
        JSONArray array = separate(output);

        // Compares all individual jsons with our test data
        boolean foundInS3 = false;
        for (Object object: array){
            if (Objects.equals(object.toString(), expectedS3.toString())){
                foundInS3 = true;
            }
        }

        assertTrue(foundInS3);
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
     * This adds the current timestamp to the event_name to ensure the message is unique
     *
     * @param json  This is the json which the event_name is being changed
     * @return      Returns the amended json
     */
    private JSONObject addTimestamp(JSONObject json){
        if (json.has("event_name")){
            if (timestamp == null){
                timestamp = Instant.now().toString();
            }
            json.put("event_name", json.getString("event_name")+" "+timestamp);
        }
        return json;
    }

    /**
     * This separates the batched jsons into a json array
     *
     * @param input The batched jsons
     * @return      The array of jsons
     */
    private JSONArray separate(String input){
        JSONArray output = new JSONArray();
        for (int index = 0; index < input.length(); ) {
            if (input.charAt(index) == '{') {
                int close = findBracket(input, index);
                output.put(new JSONObject(input.substring(index, close+1)));
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
}
