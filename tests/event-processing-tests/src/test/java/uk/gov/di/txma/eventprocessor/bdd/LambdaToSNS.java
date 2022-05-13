package uk.gov.di.txma.eventprocessor.bdd;

import io.cucumber.gherkin.internal.com.eclipsesource.json.JsonObject;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.hamcrest.CoreMatchers;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONArray;
import org.json.JSONObject;
import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;
import software.amazon.awssdk.services.lambda.model.LambdaException;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.SnsException;
import software.amazon.awssdk.services.sns.model.SubscribeRequest;
import software.amazon.awssdk.services.sns.model.SubscribeResponse;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Scanner;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;


public class LambdaToSNS {
    Region region = Region.EU_WEST_2;
    String output;
    String input;
    String MicroOutput;
    private static final String MESSAGE_SERVER_URL = "http://localhost:";
    private static final String MESSAGE_SERVER_PORT = "8080";
    private static final String HEALTH_ENDPOINT = "/actuator/health";
    private final CloseableHttpClient httpClient = HttpClients.createDefault();
    private static final String TOPIC_ARN = "arn:aws:sns:eu-west-2:750703655225:EventProcessorSNSTopic-build";

    @Given("the Message Service is running")
    public void the_message_service_is_running() {
        HttpGet request = new HttpGet(MESSAGE_SERVER_URL + MESSAGE_SERVER_PORT + HEALTH_ENDPOINT);
        request.addHeader("accept", "application/json");
        try {
            HttpResponse response = httpClient.execute(request);
            assertEquals(200, response.getStatusLine().getStatusCode());
            String responseString = convertResponseToString(response);
            assertThat(responseString, CoreMatchers.containsString("{\"status\":\"UP\"}"));

        } catch (Exception e) {
            fail();
            System.out.println(e.getMessage());
        }

    }

    @And("the SQS file {string} is available")
    public void the_SQS_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        input = Files.readString(filePath);
    }

    @And("the output file {string} is available")
    public void the_output_file_is_available(String filename) throws IOException{
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename).getAbsolutePath());
        output = Files.readString(filePath);
    }

    @And("I have a subscription to the EP SNS")
    public void setupSNS() {
        SnsClient snsClient = SnsClient.builder()
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
                .region(region)
                .build();

        try {
            SubscribeRequest request = SubscribeRequest.builder()
                    .protocol("http")
                    .endpoint("http://localhost:8080/messages")
                    .returnSubscriptionArn(true)
                    .topicArn(TOPIC_ARN)
                    .build();

            SubscribeResponse result = snsClient.subscribe(request);
            System.out.println("Subscription ARN is " + result.subscriptionArn() + "\n\n Status is " + result.sdkHttpResponse().statusCode());

        } catch (SnsException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
        System.out.println("here");
    }

    @When("the {string} lambda is invoked")
    public void the_lambda_is_invoked(String account) {
        String functionName = "EventProcessorFunction-"+account;
        LambdaClient awsLambda = LambdaClient.builder()
                .region(region)
                .build();

        InvokeResponse res;

        try {
            SdkBytes payload = SdkBytes.fromUtf8String(input) ;

            InvokeRequest request = InvokeRequest.builder()
                    .functionName(functionName)
                    .payload(payload)
                    .build();

            res = awsLambda.invoke(request);
            String value = res.payload().asUtf8String();

            assertEquals(200, res.sdkHttpResponse().statusCode());
            assertThat(value, not(containsString("errorType"))); //Error in processing within the lambda function

        } catch(LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    @Then("the event is available from my subscription")
    public void the_event_is_available_from_my_subscription() {
        HttpGet request = new HttpGet(MESSAGE_SERVER_URL + MESSAGE_SERVER_PORT + "/message/latest");
        request.addHeader("accept", "application/json");
        try {
            HttpResponse response = httpClient.execute(request);
            assertEquals(200, response.getStatusLine().getStatusCode());
            String responseString = convertResponseToString(response);
            System.out.println(responseString);
            assertThat(responseString, CoreMatchers.containsString("{\"Type\":\"SubscriptionConfirmation\""));
            assertThat(responseString, CoreMatchers.containsString("\"MessageId\":\"123456789-abc-fhjikluyt-0004\""));
            assertThat(responseString, CoreMatchers.containsString("\"Message\":\"You have chosen to subscribe to the topic arn:aws:sns:us-west-2:123456789012:MyTopic.\\nTo confirm the subscription, visit the SubscribeURL included in this message.\""));

        } catch (Exception e) {
            fail();
            System.out.println(e.getMessage());
        }
    }

    @And("this event is equal to the output file")
    public void this_event_is_equal_to_the_output_file() {
        assertTrue(MicroOutput.contains(output));
    }

    private String convertResponseToString(HttpResponse response) throws IOException {
        InputStream responseStream = response.getEntity().getContent();
        Scanner scanner = new Scanner(responseStream, "UTF-8");
        String responseString = scanner.useDelimiter("\\Z").next();
        scanner.close();
        return responseString;
    }
}
