package uk.gov.di.txma.eventprocessor.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
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
import java.util.zip.GZIPInputStream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;


public class LambdaToS3 {
    Region region = Region.EU_WEST_2;
    String output;
    String input;
    Instant time;


    @Given("the SQS file {string} is available")
    public void the_SQS_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        input = Files.readString(filePath);
    }

    @And("the output file {string} is available")
    public void the_output_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        Files.readString(filePath);
    }

    @When("the {string} lambda is invoked")
    public void the_lambda_is_invoked(String account) {
        time = Instant.now();
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

        } catch (LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }

    }

    @Then("there shouldn't be an error message in the {string} lambda cloudwatch")
    public void there_shouldnt_be_an_error_message_in_the_lambda_cloudwatch(String account) throws InterruptedException {
        Thread.sleep(10000);

        String logGroupName = "/aws/lambda/EventProcessorFunction-" + account;

        Region region = Region.EU_WEST_2;
        CloudWatchLogsClient cloudWatchLogsClient = CloudWatchLogsClient.builder()
                .region(region)
                .build();

        DescribeLogStreamsRequest req = DescribeLogStreamsRequest.builder().logGroupName(logGroupName).orderBy("LastEventTime").descending(true).build();
        DescribeLogStreamsResponse res2 = cloudWatchLogsClient.describeLogStreams(req);
        String logStreamName = res2.logStreams().get(0).logStreamName();
        try {
            GetLogEventsRequest getLogEventsRequest = GetLogEventsRequest.builder()
                    .logGroupName(logGroupName)
                    .logStreamName(logStreamName)
                    .startFromHead(false)
                    .build();

            String possErr = cloudWatchLogsClient.getLogEvents(getLogEventsRequest).events().get(1).message();
            assertThat(possErr, not(containsString("ERROR")));
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
        String expectedS3 = Files.readString(filePath);
        assertTrue(output.contains(expectedS3));
    }


}
