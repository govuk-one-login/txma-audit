package step_definitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.firehose.FirehoseClient;
import software.amazon.awssdk.services.firehose.model.FirehoseException;
import software.amazon.awssdk.services.firehose.model.PutRecordRequest;
import software.amazon.awssdk.services.firehose.model.PutRecordResponse;
import software.amazon.awssdk.services.firehose.model.Record;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class Auth_SNStoS3 {
    private static final String key = "testKey";
    private static final String firehoseName = "arn:aws:firehose:eu-west-2:761029721660:deliverystream/AuditFireHose-build"; //Need to check firehose name and full arn
    private static final String bucketName = "arn:aws:s3:eu-west-2:761029721660:audit-resources-build-messagebatchbucket-1vpvbe3ndfd6s"; //Need to check bucket name and full arn
    private static S3Client s3;
    SdkBytes output;
    SdkBytes input;
    String json;

    @Given("^the datafile {string} is available")
    public void loaddatafile(String fileName) throws Exception {
        String path = new File("src/test/resources/Test Data/" + fileName).getAbsolutePath();
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + fileName).getAbsolutePath());
        String json = Files.readString(filePath);
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

        GetObjectRequest getObjectRequest = GetObjectRequest.builder() //I feel like you don't need the above code, but region should be below?
            .bucket(bucketName)
            .key(key)
            .build();

        try {
            GetObjectRequest objectRequest = GetObjectRequest
                    .builder()
                    .key(key)
                    .bucket(bucketName)
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3.getObjectAsBytes(objectRequest);
            byte[] data = objectBytes.asByteArray();
            output = SdkBytes.fromByteArray(data);
            assertNotNull(output);
        } catch (S3Exception e) {
          System.err.println(e.awsErrorDetails().errorMessage());
           System.exit(1);
        }
        //We need to decide if we want to delete the object after the test, or just leave the test in the S3 bucket
    }

    @And("^the event data should match with the expected data file <>")
    public void theEventDataShouldMatchWithTheExpectedDataFile() {
        assertEquals(input, output);
    }
}
