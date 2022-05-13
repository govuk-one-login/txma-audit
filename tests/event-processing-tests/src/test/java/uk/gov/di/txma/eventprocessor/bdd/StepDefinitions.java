//package uk.gov.di.txma.eventprocessor.bdd;
//
//import io.cucumber.java.en.Given;
//import io.cucumber.java.en.Then;
//import io.cucumber.java.en.When;
//import org.apache.http.HttpResponse;
//import org.apache.http.client.methods.HttpGet;
//import org.apache.http.impl.client.CloseableHttpClient;
//import org.apache.http.impl.client.HttpClients;
//import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
//import software.amazon.awssdk.core.SdkBytes;
//import software.amazon.awssdk.regions.Region;
//import software.amazon.awssdk.services.lambda.LambdaClient;
//import software.amazon.awssdk.services.lambda.model.InvokeRequest;
//import software.amazon.awssdk.services.lambda.model.InvokeResponse;
//import software.amazon.awssdk.services.lambda.model.LambdaException;
//import software.amazon.awssdk.services.sns.SnsClient;
//import software.amazon.awssdk.services.sns.model.SnsException;
//import software.amazon.awssdk.services.sns.model.SubscribeRequest;
//import software.amazon.awssdk.services.sns.model.SubscribeResponse;
//
//import java.io.IOException;
//import java.io.InputStream;
//import java.util.Scanner;
//
//import static org.hamcrest.MatcherAssert.assertThat;
//import static org.junit.jupiter.api.Assertions.*;
//import static org.hamcrest.CoreMatchers.containsString;
//
//public class StepDefinitions {
//
//    private static final Region REGION = Region.EU_WEST_2;
//
//    // Hardcoded reference to build account - should this be dynamic?
//    private static final String LAMBDA_ARN = "arn:aws:lambda:eu-west-2:750703655225:function:EventProcessorFunction-SPOT";
//    private static final String TOPIC_ARN = "arn:aws:sns:eu-west-2:750703655225:EventProcessorSNSTopic-build";
//
//    private static final String MESSAGE_SERVER_URL = "http://localhost:";
//    private static final String MESSAGE_SERVER_PORT = "8080";
//    private static final String HEALTH_ENDPOINT = "/actuator/health";
//
//    private final CloseableHttpClient httpClient = HttpClients.createDefault();
//
//    @Given("^The Message Service is running")
//    public void checkMessageService() {
//        HttpGet request = new HttpGet(MESSAGE_SERVER_URL + MESSAGE_SERVER_PORT + HEALTH_ENDPOINT);
//        request.addHeader("accept", "application/json");
//        try {
//            HttpResponse response = httpClient.execute(request);
//            assertEquals(200, response.getStatusLine().getStatusCode());
//            String responseString = convertResponseToString(response);
//            assertThat(responseString, containsString("{\"status\":\"UP\"}"));
//
//        } catch (Exception e) {
//            fail();
//            System.out.println(e.getMessage());
//        }
//
//    }
//
//    @Given("^I have a subscription to the EP SNS")
//    public void setupSNS() {
//        SnsClient snsClient = SnsClient.builder()
//                .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
//                .region(REGION)
//                .build();
//
//        try {
//            SubscribeRequest request = SubscribeRequest.builder()
//                    .protocol("http")
//                    .endpoint("http://localhost:8080/messages")
//                    .returnSubscriptionArn(true)
//                    .topicArn(TOPIC_ARN)
//                    .build();
//
//            SubscribeResponse result = snsClient.subscribe(request);
//            System.out.println("Subscription ARN is " + result.subscriptionArn() + "\n\n Status is " + result.sdkHttpResponse().statusCode());
//
//        } catch (SnsException e) {
//            System.err.println(e.awsErrorDetails().errorMessage());
//            System.exit(1);
//        }
//    }
//
//    @When("^the EventProcessor Lambda is invoked")
//    public void invokeEventProcessorLambda() {
//
//        LambdaClient awsLambda = LambdaClient.builder()
//                .region(REGION)
//                .build();
//
//        InvokeResponse res = null;
//
//        try {
//            //Need a SdkBytes instance for the payload
//            String json = "{\"Hello \":\"Paris\"}";
//            SdkBytes payload = SdkBytes.fromUtf8String(json) ;
//
//            //Setup an InvokeRequest
//            InvokeRequest request = InvokeRequest.builder()
//                    .functionName(LAMBDA_ARN)
//                    .payload(payload)
//                    .build();
//
//            res = awsLambda.invoke(request);
//            String value = res.payload().asUtf8String() ;
//            System.out.println(value);
//
//        } catch(LambdaException e) {
//            System.err.println(e.getMessage());
//            System.exit(1);
//        }
//    }
//
//    @Then("^the event is available from my subscription")
//    public void getEventFromSnsSubscription() {
//        HttpGet request = new HttpGet(MESSAGE_SERVER_URL + MESSAGE_SERVER_PORT + "/message/latest");
//        request.addHeader("accept", "application/json");
//        try {
//            HttpResponse response = httpClient.execute(request);
//            assertEquals(200, response.getStatusLine().getStatusCode());
//            String responseString = convertResponseToString(response);
//            System.out.println(responseString);
//            assertThat(responseString, containsString("{\"Type\":\"SubscriptionConfirmation\""));
//            assertThat(responseString, containsString("\"MessageId\":\"123456789-abc-fhjikluyt-0004\""));
//            assertThat(responseString, containsString("\"Message\":\"You have chosen to subscribe to the topic arn:aws:sns:us-west-2:123456789012:MyTopic.\\nTo confirm the subscription, visit the SubscribeURL included in this message.\""));
//
//        } catch (Exception e) {
//            fail();
//            System.out.println(e.getMessage());
//        }
//    }
//
//    private String convertResponseToString(HttpResponse response) throws IOException {
//        InputStream responseStream = response.getEntity().getContent();
//        Scanner scanner = new Scanner(responseStream, "UTF-8");
//        String responseString = scanner.useDelimiter("\\Z").next();
//        scanner.close();
//        return responseString;
//    }
//}
//
