package uk.gov.di.txma.audit.bdd;

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

public class SNStoS3 {
    private static final String firehoseName = "AuditFireHose-build";
    private static final String bucketName = "audit-resources-build-messagebatchbucket-1vpvbe3ndfd6s";
    private static S3Client s3;

    String output;
    SdkBytes input;
    ArrayList<String> keys = new ArrayList<>();
    String SNSInput;
    String expectedS3;

    @Given("the input file {string} is available")
    public void the_input_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        SNSInput = Files.readString(filePath);
    }

    @And("the expected file {string} is available")
    public void the_expected_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        expectedS3 = Files.readString(filePath);
    }

    @And("we can read all current S3 keys")
    public void we_can_read_all_current_S3_keys() {
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

            for (S3Object s3object : objects) {
                keys.add(s3object.key());
            }
        } catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
    }

    @When("the message is sent to firehose")
    public void the_message_is_sent_to_firehose() {
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
            assertNotNull(recordResponse.recordId());
        } catch (FirehoseException e) {
            System.out.println(e.getLocalizedMessage());
            System.exit(1);
        }
    }

    @Then("the s3 should have a new event data")
    public void the_S3_should_have_a_new_event_data() throws InterruptedException {
        String newkey = null;
        int timer = 0;

        while (timer < 20 && newkey == null){
            Thread.sleep(60000);
            timer ++;
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
        assertTrue(output.contains(expectedS3));
    }

}
