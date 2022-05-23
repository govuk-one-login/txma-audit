package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Stack;
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

    @Given("the input file {string} is available")
    public void the_input_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);

        JSONObject json = new JSONObject(file);
        SNSInput = addTimestamp(json).toString();
    }

    @And("the expected file {string} is available")
    public void the_expected_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        String file = Files.readString(filePath);

        JSONObject json = new JSONObject(file);
        expectedS3 = addTimestamp(json);
    }

    @When("the message is sent to firehose")
    public void the_message_is_sent_to_firehose() {
        String firehoseName = "AuditFireHose-build";
        Region region = Region.EU_WEST_2;

        try (FirehoseClient firehoseClient = FirehoseClient.builder()
                .region(region)
                .build()) {

            input = SdkBytes.fromUtf8String(SNSInput);

            Record record = Record.builder()
                    .data(input)
                    .build();

            PutRecordRequest recordRequest = PutRecordRequest.builder()
                    .deliveryStreamName(firehoseName)
                    .record(record)
                    .build();

            PutRecordResponse recordResponse = firehoseClient.putRecord(recordRequest);
            assertEquals(200, recordResponse.sdkHttpResponse().statusCode());
        } catch (FirehoseException e) {
            System.out.println(e.getLocalizedMessage());
            System.exit(1);
        }
    }

    @Then("the s3 should have a new event data")
    public void the_s3_should_have_a_new_event_data() throws InterruptedException {
        String newkey = null;
        String bucketName = "audit-build-message-batch";
        int timer = 0;

        Region region = Region.EU_WEST_2;
        S3Client s3 = S3Client.builder()
                .region(region)
                .build();

        while (timer < 20 && newkey == null){
            timer ++;
            Thread.sleep(65000);
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

    @And("the event data should match with the S3 file")
    public void the_event_data_should_match_with_the_S3_file() {
        JSONArray array = separate(output);

        boolean foundInS3 = false;
        for (Object object: array){
            if (Objects.equals(object.toString(), expectedS3.toString())){
                foundInS3 = true;
            }
        }

        assertTrue(foundInS3);
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
                int close = findBracket(input, index);
                output.put(new JSONObject(input.substring(index, close+1)));
                index = close + 1;
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
        return 0;
    }
}
