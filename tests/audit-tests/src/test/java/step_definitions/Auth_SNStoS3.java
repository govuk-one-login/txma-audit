package step_definitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.zip.GZIPInputStream;

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

import java.util.ArrayList;

public class Auth_SNStoS3 {
    private static final String firehoseName = "AuditFireHose-build";
    private static final String bucketName = "audit-resources-build-messagebatchbucket-1vpvbe3ndfd6s";
    private static S3Client s3;

    String output;
    SdkBytes input;
    ArrayList<String> keys = new ArrayList<>();
    String json;

    @Given("the datafile {string} is available")
    public void the_datafile_tx_ma_ts_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        json = Files.readString(filePath);
    }

    @And("we can read all current S3 keys")
    public void weCanReadAllCurrentS3Keys() {
        Region region = Region.EU_WEST_2;
        s3 = S3Client.builder()
                .region(region)
                .build();
        try {
            ListObjectsRequest listObjects = ListObjectsRequest
                    .builder()
                    .bucket(bucketName)
                    .build();

            ListObjectsResponse res = s3.listObjects(listObjects);
            List<S3Object> objects = res.contents();

            for (S3Object myValue : objects) {
                keys.add(myValue.key());
            }
        } catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
    }

    @When("the message is sent to firehose")
    public void theMessageIsSentToFirehose() {
        Region region = Region.EU_WEST_2;

        try (FirehoseClient firehoseClient = FirehoseClient.builder()
                .region(region)
                .build()) {

            input = SdkBytes.fromUtf8String(json);

            Record record = Record.builder()
                    .data(input)
                    .build();

            PutRecordRequest recordRequest = PutRecordRequest.builder()
                    .deliveryStreamName(firehoseName)
                    .record(record)
                    .build();

            PutRecordResponse recordResponse = firehoseClient.putRecord(recordRequest);
            assertNotNull(recordResponse.recordId());
        } catch (FirehoseException e) {
            System.out.println(e.getLocalizedMessage());
            System.exit(1);
        }
    }

    @Then("the s3 should have a new event data")
    public void theS3ShouldHaveANewEventData() throws InterruptedException {
        String newkey = null;

        int count = 0;

        while (count < 15 && newkey == null){
            Thread.sleep(60000);
            count ++;
            try {
                ListObjectsRequest listObjects = ListObjectsRequest
                        .builder()
                        .bucket(bucketName)
                        .build();

                ListObjectsResponse res = s3.listObjects(listObjects);
                List<S3Object> objects = res.contents();

                for (S3Object object : objects) {
                    if (!keys.contains(object.key())){
                        newkey = object.key();
                    }
                }

            } catch (S3Exception e) {
                System.err.println(e.awsErrorDetails().errorMessage());
                System.exit(1);
            }
        }

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

    @And("the event data should match with the expected data file {string}")
    public void theEventDataShouldMatchWithTheExpectedDataFile(String filename) throws IOException {
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        json = Files.readString(filePath);
        assertTrue(output.contains(json));
    }

}
