package step_definitions;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.GZIPInputStream;

import io.cucumber.messages.JSON;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.firehose.FirehoseClient;
import software.amazon.awssdk.services.firehose.model.FirehoseException;
import software.amazon.awssdk.services.firehose.model.PutRecordRequest;
import software.amazon.awssdk.services.firehose.model.PutRecordResponse;
import software.amazon.awssdk.services.firehose.model.Record;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class Auth_SNStoS3 {
    private static final String key = "firehose/2022/05/05/15/AuditFireHose-build-2-2022-05-05-15-04-43-fd62a4e6-2fe0-4c52-b683-583baecbf03d.gz";
    private static final String firehoseName = "AuditFireHose-build";
    private static final String bucketName = "audit-resources-build-messagebatchbucket-1vpvbe3ndfd6s";
    private static S3Client s3;

    String readed;
    SdkBytes output;
    SdkBytes input;
    String json;

    @Given("the datafile {string} is available")
    public void the_datafile_tx_ma_ts_is_available(String filename) {
        Path filePath = Path.of(new File("src/test/resources/Test Data/" +filename).getAbsolutePath());
        try {
            json = Files.readString(filePath);
        }
        catch (IOException ignored) {

        }
    }

    @When("^the lambda is invoked")
    public void theLambdaIsInvoked() {
        Region region = Region.EU_WEST_2;
        FirehoseClient firehoseClient = FirehoseClient.builder()
                .region(region)
                .build();

        try {
            input = SdkBytes.fromUtf8String(json);

            Record record = Record.builder()
                    .data(input)
                    .build();

            PutRecordRequest recordRequest = PutRecordRequest.builder()
                    .deliveryStreamName(firehoseName)
                    .record(record)
                    .build();

            PutRecordResponse recordResponse = firehoseClient.putRecord(recordRequest) ;
            assertNotNull(recordResponse.recordId());
            System.out.println("recordID: " + recordResponse.recordId());
            System.out.println("input: " + input);
            System.out.println("json: " + json);
            System.out.println("input string: " + input.toString());
        } catch (FirehoseException e) {
            System.out.println(e.getLocalizedMessage());
            System.exit(1);
        } finally {
            firehoseClient.close();
        }
    }

    @Then("^the s3 should have a new event data")
    public void theS3ShouldHaveANewEventData() {
        Region region = Region.EU_WEST_2;
        s3 = S3Client.builder()
                .region(region)
                .build();

        try {
            GetObjectRequest objectRequest = GetObjectRequest
                    .builder()
                    .key(key)
                    .bucket(bucketName)
                    .build();

            GZIPInputStream gzis = new GZIPInputStream(s3.getObject(objectRequest));
            InputStreamReader reader = new InputStreamReader(gzis);
            BufferedReader in = new BufferedReader(reader);
            readed = in.readLine();



        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        //We need to decide if we want to delete the object after the test, or just leave the test in the S3 bucket
    }

    @And("^the event data should match with the expected data file <>")
    public void theEventDataShouldMatchWithTheExpectedDataFile() {
        assertEquals(readed.contains(json), true);
    }
}
