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


public class LambdaToS3 {
    Region region = Region.EU_WEST_2;
    String output;
    String input;
    Instant time = Instant.now();
    String requestid;
    String timestamp;


    @Given("the SQS file {string} is available")
    public void the_SQS_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);

        JSONObject json = new JSONObject(file);
        JSONObject change = addTimestamp(json);
        input = wrapJSON(change);
        System.out.println(input);
    }

    @And("the output file {string} is available")
    public void the_output_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        Files.readString(filePath);
    }

    @When("the {string} lambda is invoked")
    public void the_lambda_is_invoked(String account) {
        String functionName = "EventProcessorFunction-" + account;
        LambdaClient awsLambda = LambdaClient.builder()
                .region(region)
                .build();

        InvokeResponse res;

        try {
            SdkBytes payload = SdkBytes.fromUtf8String(input);

            InvokeRequest request = InvokeRequest.builder()
                    .functionName(functionName)
                    .invocationType("Event")
                    .payload(payload)
                    .build();

            res = awsLambda.invoke(request);

            assertEquals(202, res.sdkHttpResponse().statusCode());
            requestid = res.responseMetadata().requestId();

        } catch (LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }

    }

    @Then("there shouldn't be an error message in the {string} lambda cloudwatch")
    public void there_shouldnt_be_an_error_message_in_the_lambda_cloudwatch(String account) throws InterruptedException {

        String logGroupName = "/aws/lambda/EventProcessorFunction-" + account;

        boolean noEvent = true;

        Region region = Region.EU_WEST_2;
        CloudWatchLogsClient cloudWatchLogsClient = CloudWatchLogsClient.builder()
                .region(region)
                .build();

        try {
            while (noEvent){
                Thread.sleep(2000);

                DescribeLogStreamsRequest req = DescribeLogStreamsRequest.builder().logGroupName(logGroupName).orderBy("LastEventTime").descending(true).build();
                DescribeLogStreamsResponse res2 = cloudWatchLogsClient.describeLogStreams(req);
                String logStreamName = res2.logStreams().get(0).logStreamName();

                GetLogEventsRequest getLogEventsRequest = GetLogEventsRequest.builder()
                        .logGroupName(logGroupName)
                        .logStreamName(logStreamName)
                        .startFromHead(false)
                        .build();

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

    @And("the {string} s3 should have a new event data")
    public void the_s3_should_have_a_new_event_data(String endpoint) throws InterruptedException {
        String newkey = null;
        String bucketName = "event-processing-build-"+endpoint+"-splunk-test";
        int timer = 0;

        Region region = Region.EU_WEST_2;
        S3Client s3 = S3Client.builder()
                .region(region)
                .build();

        while (timer < 20 && newkey == null){
            timer ++;
            try {
                ListObjectsRequest listObjects = ListObjectsRequest
                        .builder()
                        .bucket(bucketName)
                        .build();
                ListObjectsResponse res = s3.listObjects(listObjects);
                List<S3Object> objects = res.contents();
                S3Object latest = objects.get(objects.size() - 1);
                if (latest.lastModified().compareTo(time)>0){
                    newkey = latest.key();
                }

            } catch (S3Exception e) {
                System.err.println(e.awsErrorDetails().errorMessage());
                System.exit(1);
            }
            if (newkey == null){
                Thread.sleep(60000);
            }
        }

        assertNotNull(newkey);

        try {
            GetObjectRequest objectRequest = GetObjectRequest
                    .builder()
                    .key(newkey)
                    .bucket(bucketName)
                    .build();

            GZIPInputStream gzinpstr = new GZIPInputStream(s3.getObject(objectRequest));
            InputStreamReader inpstr = new InputStreamReader(gzinpstr);
            BufferedReader read = new BufferedReader(inpstr);
            output = read.readLine();

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @And("the event data should match with the {string} file")
    public void the_event_data_should_match_with_the_file(String filename) throws IOException {
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);

        JSONObject json = new JSONObject(file);
        JSONObject expectedS3 = addTimestamp(json);

        JSONArray array = separate(output);

        boolean foundInS3 = false;
        for (Object object: array){
            if (Objects.equals(object.toString(), expectedS3.toString())){
                foundInS3 = true;
            }
        }

        assertTrue(foundInS3);
    }

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

    private JSONObject addTimestamp(JSONObject json){
        if (json.has("event_name")){
            if (timestamp == null){
                timestamp = Instant.now().toString();
            }
            json.put("event_name", json.getString("event_name")+" "+timestamp);
        }
        return json;
    }

    private JSONArray separate(String input){
        JSONArray output = new JSONArray();
        for (int index = 0; index < input.length(); ) {
            if (input.charAt(index) == '{') {
                int close = findBracket(input, index);  // find the  close parentheses
                output.put(new JSONObject(input.substring(index, close+1)));
                index = close + 1;  // skip content and nested parentheses
            } else {
                index++;
            }
        }
        return output;
    }

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
        // unreachable if your parentheses is balanced
        return 0;
    }
}
