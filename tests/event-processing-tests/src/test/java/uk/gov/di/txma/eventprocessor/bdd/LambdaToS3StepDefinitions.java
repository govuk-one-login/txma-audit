package uk.gov.di.txma.eventprocessor.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.cucumber.datatable.DataTable;
import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.WebDriverWait;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatch.model.CloudWatchException;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.cloudwatchlogs.model.DescribeLogStreamsRequest;
import software.amazon.awssdk.services.cloudwatchlogs.model.DescribeLogStreamsResponse;
import software.amazon.awssdk.services.cloudwatchlogs.model.GetLogEventsRequest;
import software.amazon.awssdk.services.cloudwatchlogs.model.LogStream;
import software.amazon.awssdk.services.cloudwatchlogs.model.OutputLogEvent;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;
import software.amazon.awssdk.services.lambda.model.LambdaException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import uk.gov.di.ipv_core.utilities.Driver;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.Stack;
import java.util.zip.GZIPInputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LambdaToS3StepDefinitions {
    Region region = Region.EU_WEST_2;
    String output = null;
    String lambdaInput;
    Long timestamp = Instant.now().toEpochMilli();
    String invokedLambdasLog;
    String requestID;
    int count = 0;

    /**
     * Checks that the input test data is present. And changes it to look like an SQS message
     *
     * @param fileName      The name of the file which act as the SQS input from the service teams' accounts
     * @param account       The name of the team which the event if from
     * @throws IOException
     */
    @Given("the SQS file {string} is available for the {string} team")
    public void checkSQSInputFileIsAvailable(String fileName, String account) throws IOException {
        JSONObject rawJSON = new JSONObject(readJSONFile(fileName));
        JSONObject enrichedJSON = addComponentIdAndTimestampFields(rawJSON, account);
        lambdaInput = wrapJSONObjectAsAnSQSMessage(enrichedJSON);
    }

    @Given("the SQS file {string} is available in the {string} folder")
    public void checkSQSInputFileIsAvailableInFolder(String fileName, String account) throws IOException {
        JSONObject rawJSON = new JSONObject(readJSONFile(account + "/" + fileName));
        JSONObject enrichedJSON = addComponentIdAndTimestampFields(rawJSON, account);
        lambdaInput = wrapJSONObjectAsAnSQSMessage(enrichedJSON);
    }

    /**
     * Checks the expected S3 output file is present
     *
     * @param fileName      The name of the file which act as the S3 output from the service teams' accounts
     * @param endpoints     The endpoints we're checking against
     * @throws IOException
     */
    @And("the output file {string} in the {string} folder is available")
    public void checkEndpointJSONIsAvailable(String fileName, String account, DataTable endpoints) throws IOException{
        // Loops through the possible endpoints
        Set<String> extractedKeys = endpoints.asMap().keySet();
        for (String teamName : extractedKeys) {
            readJSONFile(account + "/" + teamName + "_" + fileName);
        }
    }

    /**
     * Invokes the initial lambda to start the data flow
     *
     * @param account   The service team account name for their corresponding lambda
     */
    @When("the {string} lambda is invoked")
    public void invokeAccountsLambda(String account) {
        String functionName = "EventProcessorFunction-" + account;

        // Opens the lambda client
        try (LambdaClient awsLambda = LambdaClient.builder()
                .region(region)
                .build()){

            // Invoke the lambda with the input data
            SdkBytes payload = SdkBytes.fromUtf8String(lambdaInput);
            InvokeRequest request = InvokeRequest.builder()
                    .functionName(functionName)
                    .logType("Tail")
                    .payload(payload)
                    .build();
            InvokeResponse invokedResponse = awsLambda.invoke(request);

            // Checks the data is sent, and records the Request ID to track it
            assertEquals(200, invokedResponse.sdkHttpResponse().statusCode(), "A problem calling the lambda. HTTP response was incorrect.");
            invokedLambdasLog = new String (Base64.getDecoder().decode(invokedResponse.logResult()), StandardCharsets.UTF_8);
            requestID = invokedResponse.responseMetadata().requestId();

        } catch (LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    /**
     * Ensures that the provided string does appear in cloudwatch log produced when the lambda was invoked
     *
     * @param message   The message which should appear in the cloudwatch logs
     * @param account   Which account inputted the message
     */
    @Then("there should be a {string} message in the {string} lambda logs")
    public void checkForMessageInAccountsLambdaLog(String message, String account) throws InterruptedException {
        // Checks if the initial log from the lambda invoke contains the required message
        if (!invokedLambdasLog.contains(message)){
            // If the log did not contain the message, we send an empty invoke to force the correct log through
            sendEmptyPayloadToLambda(account);
            // We can then search for this message in the CloudWatch logs
            String logGroup = "/aws/lambda/EventProcessorFunction-" + account;
            assertTrue(areSearchStringsFoundForGroup(logGroup, requestID, message), "No log from the lambda contained a " + message + " message.");
        }
    }

    /**
     * This searches the S3 bucket and checks that the new data contains the output file
     *
     * @param account       Which account inputted the message
     * @param fileName      The name of the file which act as the S3 output from the service teams' accounts
     * @param endpoints     The endpoints we're checking against
     * @throws IOException
     */
    @And("the s3 below should have a new event matching the respective {string} output file {string} in the {string} folder")
    public void checkTheObjectInS3IsAsExpected(String account, String fileName, String folderName, DataTable endpoints) throws IOException, InterruptedException {
        // Loops through the possible endpoints
        Set<String> extractedKeys = endpoints.asMap().keySet();
        for (String teamName : extractedKeys){
            // Checks that the output is present for each endpoint
            assertTrue(isFoundInS3(teamName, folderName + "/" + teamName + "_" + fileName, account),  "The message " + fileName + " from " + account + " was not found in the " + teamName + " S3 bucket.");
        }
    }

    @And("the s3 below should have a new event matching the output file {string} in the {string} folder")
    public void checkTheObjectInTheFileIsInS3IsAsExpected(String fileName, String account, DataTable endpoints) throws IOException, InterruptedException {
        // Loops through the possible endpoints
        Set<String> extractedKeys = endpoints.asMap().keySet();
        for (String teamName : extractedKeys){
            // Checks that the output is present for each endpoint
            assertTrue(isFoundInS3(teamName, account + "/" + teamName + "_" + fileName, account),  "The message " + fileName + " from " + account + " was not found in the " + teamName + " S3 bucket.");
        }
    }

    /**
     * This searches the S3 bucket and checks that any new data does not contain the output file
     *
     * @param account       Which account inputted the message
     * @param fileName      The name of the file which act as the S3 output from the service teams' accounts
     * @param endpoints     The endpoints we're checking against
     * @throws IOException
     */
    @And("the S3 below should not have a new event matching the respective {string} output file {string} in the {string} folder")
    public void checkTheObjectIsNotInS3(String account, String fileName, String folderName, DataTable endpoints) throws IOException, InterruptedException {
        // Loops through the possible outputs
        Set<String> extractedKeys = endpoints.asMap().keySet();
        for (String teamName : extractedKeys){
            // Checks that the output is present for each endpoint
            assertFalse(isFoundInS3(teamName,folderName + "/" + teamName + "_" + fileName, account),  "The message " + fileName + " from " + account + " was found in the " + teamName + " S3 bucket.");
        }
    }

    @Given("user is on Passport CRI staging")
    public void navigateToPassportCriURL() throws IOException {
        Driver.get().get(gov.di_ipv_core.utilities.ConfigurationReader.getCoreStubUrl());
        WebDriverWait wait = new WebDriverWait(Driver.get(), 10);
        assertTrue(Driver.get().getCurrentUrl().endsWith("/passport/details"));
    }
    @When("user completes address journey successfully")
    public void fillInPassportDetails() {

        WebElement PassportNumber = Driver.get().findElement(By.id("passportNumber"));
        PassportNumber.sendKeys("824159121");
        WebElement Surname = Driver.get().findElement(By.id("surname"));
        Surname.sendKeys("Watson");
        WebElement FirstName = Driver.get().findElement(By.id("firstName"));
        FirstName.sendKeys("Mary");
        WebElement birthDay = Driver.get().findElement(By.id("dateOfBirth-day"));
        birthDay.sendKeys("25");
        WebElement birthMonth = Driver.get().findElement(By.id("dateOfBirth-month"));
        birthMonth.sendKeys("02");
        WebElement birthYear = Driver.get().findElement(By.id("dateOfBirth-year"));
        birthYear.sendKeys("1932");
        WebElement PassportExpiryDay = Driver.get().findElement(By.id("expiryDate-day"));
        PassportExpiryDay.sendKeys("01");
        WebElement PassportExpiryMonth = Driver.get().findElement(By.id("expiryDate-month"));
        PassportExpiryMonth.sendKeys("03");
        WebElement PassportExpiryYear = Driver.get().findElement(By.id("expiryDate-year"));
        PassportExpiryYear.sendKeys("2031");
        WebElement PassportContinueButton = Driver.get().findElement(By.xpath("//button[@class='govuk-button button']"));
        PassportContinueButton.click();

    }

    @Then("the audit event should appear in TxMA")
    public void checkSQSInputFilsAvailable(String fileName, String account) throws IOException {
        JSONObject rawJSON = new JSONObject(readJSONFile(fileName));
        JSONObject enrichedJSON = addComponentIdAndTimestampFields(rawJSON, account);
        lambdaInput = wrapJSONObjectAsAnSQSMessage(enrichedJSON);
    }

    /**
     * Wraps the input json to look like an SQS message
     *
     * @param json  The json to be wrapped
     * @return      The wrapped json
     */
    private String wrapJSONObjectAsAnSQSMessage(JSONObject json){
        JSONObject record = new JSONObject();
        // Adds a sample SQS attribute
        record.put("messageId", "059f36b4-87a3-44ab-83d2-661975830a7d");

        // Adds the required message
        record.put("body", json.toString());

        // Creates an array to store this SQS message
        JSONArray array = new JSONArray();
        array.put(record);

        // Creates the SQS JSON
        JSONObject wrapped = new JSONObject();
        wrapped.put("Records", array);

        return wrapped.toString();
    }

    /**
     * This adds the current timestamp to the nearest millisecond (if timestamp was already present)
     * and adds the component_id (if component_id was already present)
     *
     * @param messageAsJSON      This is the json which is to be changed
     * @param account   This is the account name to be added to the component_id
     * @return          Returns the amended json
     */
    private JSONObject addComponentIdAndTimestampFields(JSONObject messageAsJSON, String account){

        // Only adds the new component_id if it's already in the file and empty
        if (messageAsJSON.has("component_id") && messageAsJSON.get("component_id").toString().isEmpty()){
            messageAsJSON.put("component_id", account);
        }
        // Only adds the new timestamp if it's already in the file
        if (messageAsJSON.has("timestamp")){
            messageAsJSON.put("timestamp", timestamp);
        }
        return messageAsJSON;
    }

    /**
     * Finds the latest 2 keys in the S3 bucket and saves the contents in the output variable
     *
     * @param endpoint  What S3 bucket to look at
     */
    private void findLatestKeysFromEventProcessingS3(String endpoint){
        String bucketName = "event-processing-"+System.getenv("TEST_ENVIRONMENT")+"-"+endpoint+"-splunk-test";

        // The list of the latest two keys
        List<String> keys = new ArrayList<>();

        // Opens an S3 client
        try (S3Client s3 = S3Client.builder()
                .region(region)
                .build()){

            // This is used to get the current year, so that we can search the correct s3 files by prefix
            ZonedDateTime currentDateTime = Instant.now().atZone(ZoneOffset.UTC);

            // Lists 1000 objects
            ListObjectsV2Request listObjects = ListObjectsV2Request
                    .builder()
                    .bucket(bucketName)
                    .prefix("firehose/"+currentDateTime.getYear()+"/")
                    .build();
            ListObjectsV2Response s3Objects = s3.listObjectsV2(listObjects);
            List<S3Object> listOfS3Objects = s3Objects.contents();

            // If no objects were found, returns nothing
            if (s3Objects.keyCount()==0){
                return;
            }

            // Stores the most recent two keys
            keys.add(listOfS3Objects.get(listOfS3Objects.size() - 1).key());
            if (s3Objects.keyCount() > 1){
                keys.add(listOfS3Objects.get(listOfS3Objects.size() - 2).key());
            }

            // If more than 1000 objects, cycles through the rest
            while (s3Objects.isTruncated()){
                // Gets the next batch
                listObjects = ListObjectsV2Request
                        .builder()
                        .bucket(bucketName)
                        .prefix("firehose/"+currentDateTime.getYear()+"/")
                        .continuationToken(s3Objects.nextContinuationToken())
                        .build();

                // Stores the batch
                s3Objects = s3.listObjectsV2(listObjects);
                listOfS3Objects = s3Objects.contents();

                // If there's more than one object, we store the most recent two keys
                // If there is only one object, we keep the latest key from the previous batch,
                // and store the most recent from this one
                if (s3Objects.keyCount() > 1){
                    keys.set(0, listOfS3Objects.get(listOfS3Objects.size() - 1).key());
                    keys.set(1, listOfS3Objects.get(listOfS3Objects.size() - 2).key());
                } else {
                    keys.set(1, listOfS3Objects.get(0).key());
                }
            }

            output = "";
            StringBuilder str = new StringBuilder(output);
            // Loops through the latest two keys
            for (String key : keys){
                // Gets the new object
                GetObjectRequest objectRequest = GetObjectRequest
                        .builder()
                        .key(key)
                        .bucket(bucketName)
                        .build();

                // Reads the new object
                GZIPInputStream gzinpstr = new GZIPInputStream(s3.getObject(objectRequest));
                InputStreamReader inpstr = new InputStreamReader(gzinpstr);
                BufferedReader read = new BufferedReader(inpstr);
                str.append(read.readLine());
            }
            // Stores the messages in output
            output = str.toString();

        } catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * This separates the batched jsons into a json array
     *
     * @param input The batched jsons
     * @return      The array of jsons
     */
    private List<JSONObject> separate(String input){
        List<JSONObject> output = new ArrayList<>();
        for (int index = 0; index < input.length(); ) {
            if (input.charAt(index) == '{') {
                int close = findBracket(input, index);
                output.add(new JSONObject(input.substring(index, close + 1)));
                index = close + 1;
            } else {
                index++;
            }
        }
        return output;
    }

    /**
     * This finds where the corresponding `}` bracket is for the current json
     *
     * @param input The batch of jsons to be separated
     * @param start The index of the opening `{` for the current within the batched jsons
     * @return      The index of the corresponding `}` bracket
     */
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

    /**
     * This searches the S3 bucket for the latest objects and compares them to the output file
     *
     * @param endpoint  Which S3 bucket we are searching
     * @param filename  The output file name
     * @param account   The account which sent the message
     * @return          True or false depending on whether the message was found or not
     * @throws IOException
     * @throws InterruptedException
     */
    public boolean isFoundInS3(String endpoint, String filename, String account) throws IOException, InterruptedException {
        // Has a retry loop in case it finds the wrong key on the first try
        // Count < 11 is enough time for it to be processed by the Firehose
        // If it is the first firehose being checked, it will wait the full time (or until it is found)
        // The counter will continue for further checks to ensure messages have enough time to pass through
        while (count < 11) {
            // Checks for latest key and saves the contents in the output variable
            output = null;
            findLatestKeysFromEventProcessingS3(endpoint);

            // If an object was found
            if (output != null) {
                // Splits the batched outputs into individual jsons
                List<JSONObject> array = separate(output);

                // Takes the input file, and adds a timestamp to the component_id
                Path filePath = Path.of(new File("src/test/resources/Test Data/" + filename + ".json").getAbsolutePath());
                String file = Files.readString(filePath);
                JSONObject json = new JSONObject(file);
                JSONObject expectedS3 = addComponentIdAndTimestampFields(json, account);

                // Compares all individual jsons with our test data
                for (JSONObject object : array) {
                    if (object.similar(expectedS3)) {
                        return true;
                    }
                }

                Thread.sleep(10000);
                count++;
            }
        }
        return false;
    }

    /**
     * This sends an empty payload through the correct lambda to force any cloudwatch logs to be processed if they haven't already
     *
     * @param account   The account which is sending the payload
     */
    public void sendEmptyPayloadToLambda(String account) {

        JSONObject json = new JSONObject();
        String empty = wrapJSONObjectAsAnSQSMessage(json);

        String functionName = "EventProcessorFunction-" + account;

        // Opens the lambda client
        try (LambdaClient awsLambda = LambdaClient.builder()
                .region(region)
                .build()) {
            // Invoke the lambda with the input data
            SdkBytes payload = SdkBytes.fromUtf8String(empty);
            InvokeRequest request = InvokeRequest.builder()
                    .functionName(functionName)
                    .payload(payload)
                    .build();

            awsLambda.invoke(request);

        } catch (LambdaException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    /**
     * This waits for cloudwatch to update and searches the logs for the inputted string(s)
     *
     * @param logGroupName  The cloudwatch log to search
     * @param toFind        The string(s) to be found
     * @return              True of false depending on whether all strings are found
     * @throws InterruptedException
     */
    public boolean areSearchStringsFoundForGroup(String logGroupName, String... toFind) throws InterruptedException {
        // Gives enough time for the cloudwatch logs to be processed
        Thread.sleep(20000);

        // Opens the cloudwatch client
        try (CloudWatchLogsClient cloudWatchLogsClient = CloudWatchLogsClient.builder()
                .region(region)
                .build()){

            // Finds all log streams in Cloudwatch
            DescribeLogStreamsRequest req = DescribeLogStreamsRequest.builder().logGroupName(logGroupName).orderBy("LastEventTime").descending(true).build();
            DescribeLogStreamsResponse res = cloudWatchLogsClient.describeLogStreams(req);
            List<LogStream> logStreams = res.logStreams();

            // Looks through all logs streams in the log group
            for (LogStream logStream : logStreams) {
                String logStreamName = logStream.logStreamName();
                // Get the messages from the latest batch of cloudwatch messages
                GetLogEventsRequest getLogEventsRequest = GetLogEventsRequest.builder()
                        .logGroupName(logGroupName)
                        .logStreamName(logStreamName)
                        .startFromHead(false)
                        .build();

                // Checks the cloudwatch log events for the inputs
                if(isSearchStringFoundInCloudWatchLogs(cloudWatchLogsClient, getLogEventsRequest, toFind)){
                    return true;
                }
            }
        } catch (CloudWatchException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }

        return false;
    }

    /**
     * Searches the events in the provided Cloudwatch Logs for the inputted string(s)
     *
     * @param cloudWatchLogsClient  The client we are using for Cloudwatch
     * @param getLogEventsRequest   The logs to search through
     * @param toFind                The string(s) to find
     * @return                      True of false depending on whether all strings are found
     */
    public Boolean isSearchStringFoundInCloudWatchLogs(CloudWatchLogsClient cloudWatchLogsClient, GetLogEventsRequest getLogEventsRequest, String... toFind){
        // Loops through all logs in the stream
        for (OutputLogEvent event : cloudWatchLogsClient.getLogEvents(getLogEventsRequest).events()) {

            // the log to be searched
            String message = event.message();

            // If all inputs were found, return true
            if (isSearchStringFoundInCurrentLog(message, toFind)){
                return true;
            }
        }
        return false;
    }

    /**
     * Searches the event for all strings
     *
     * @param message   The event to be searched
     * @param toFind    The string(s) to be found
     * @return          True of false depending on whether all strings are found
     */
    public Boolean isSearchStringFoundInCurrentLog(String message, String... toFind){
        // Loops through the inputs to be found
        for (String find : toFind){
            // If the messages does not contain the string, it has not been found
            if (!message.contains(find)) {
                return false;
            }
        }
        return true;
    }

    public String readJSONFile(String fileName) throws IOException {
        Path filePath = Path.of(new File("src/test/resources/Test Data/" + fileName + ".json").getAbsolutePath());
        return Files.readString(filePath);
    }
}
