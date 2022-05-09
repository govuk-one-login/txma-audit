package uk.gov.di.txma.eventprocessor.bdd;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;
import software.amazon.awssdk.services.lambda.model.LambdaException;

public class StepDefinitions {

    // Hardcoded reference to build account - should this be dynamic?
    private static final String functionName = "arn:aws:lambda:eu-west-2:750703655225:function:EventProcessorFunction";

    @Given("^I am on database$")
    public void i_m_on_database(){
            System.out.println("This is given");
        };

    @Given("^I have a subscription to the EP SNS")
    public void setupSNS() {
        System.out.println("SNS is setup with a subscription");
    }
    @When("^the EventProcessor Lambda is invoked")
    public static void invokeEventProcessorLambda() {

        Region region = Region.EU_WEST_2;
        LambdaClient awsLambda = LambdaClient.builder()
                .region(region)
                .build();

        InvokeResponse res = null;

        try {
            //Need a SdkBytes instance for the payload
            String json = "{\"Hello \":\"Paris\"}";
            SdkBytes payload = SdkBytes.fromUtf8String(json) ;

            //Setup an InvokeRequest
            InvokeRequest request = InvokeRequest.builder()
                    .functionName(functionName)
                    .payload(payload)
                    .build();

            res = awsLambda.invoke(request);
            String value = res.payload().asUtf8String() ;
            System.out.println(value);

        } catch(LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    @Then("^the event is available from my subscription")
    public static void getEventFromSnsSubscription() {
        System.out.println("The event is now on SNS ....");
    }
}

