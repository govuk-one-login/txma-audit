package uk.gov.di.txma.audit.bdd;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.json.JSONObject;
import pages.IPVCoreFrontPage;
import pages.VerifiableCredentialsPage;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import utilities.BrowserUtils;
import utilities.ConfigurationReader;
import utilities.Driver;
import pages.OrchestratorStubPage;
import pages.PassportPage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.GZIPInputStream;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PassportCRI_TxmaStepDefinitions {

    List<JSONObject> output = new ArrayList<>();
    Region region = Region.EU_WEST_2;
    String sub = null;

    @Given("user is on Passport CRI staging")
    public void navigateToPassportCriURL() throws IOException {
        Driver.get().get(ConfigurationReader.getOrchestratorStubUrl());
        BrowserUtils.waitForPageToLoad(10);
        new OrchestratorStubPage().DebugRoute.click();
        BrowserUtils.waitForPageToLoad(10);
        new IPVCoreFrontPage().UkPassport.click();
        BrowserUtils.waitForPageToLoad(10);
    }
    @When("user completes address journey successfully")
    public void enterPassportDetails() throws JsonProcessingException {

        new PassportPage().PassportNumber.sendKeys("824159121");
        new PassportPage().Surname.sendKeys("Watson");
        new PassportPage().FirstName.sendKeys("Mary");
        new PassportPage().birthDay.sendKeys("25");
        new PassportPage().birthMonth.sendKeys("02");
        new PassportPage().birthYear.sendKeys("1932");
        new PassportPage().PassportExpiryDay.sendKeys("01");
        new PassportPage().PassportExpiryMonth.sendKeys("03");
        new PassportPage().PassportExpiryYear.sendKeys("2031");
        new PassportPage().PassportContinueButton.click();
        new VerifiableCredentialsPage().PassportCredential_attributes_link.click();
        String PassportCRIJSONResponse = new VerifiableCredentialsPage().PassportCRIJSONResponse.getText();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(PassportCRIJSONResponse);
        sub = jsonNode.get("userId").asText();
        Driver.get().quit();
    }

    @Then("the audit event should appear in TxMA")
    public void checkPassportCriEventInTxMAS3()  throws InterruptedException {
        assertTrue(isFoundInS3());

    }

    public boolean isFoundInS3() throws InterruptedException {
        // count will make sure it only searches for a finite time
        int count = 0;

        // Has a retry loop in case it finds the wrong key on the first try
        // Count < 11 is enough time for it to be processed by the Firehose
        while (count < 11) {
            // Checks for latest key and saves the contents in the output variable
            output = new ArrayList<>();
            findLatestKeysFromAuditS3();

            // If an object was found
            if (output != null) {

                // Compares all individual jsons with our test data
                for (JSONObject object : output) {
                    if (object.toString().contains(sub)) {
                        return true;
                    }
                }
            }

            Thread.sleep(10000);
            count ++;
        }
        return false;
    }

    private void findLatestKeysFromAuditS3(){
        String bucketName = "audit-" + System.getenv("TEST_ENVIRONMENT") + "-message-batch";
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
            ListObjectsV2Response res = s3.listObjectsV2(listObjects);
            List<S3Object> objects = res.contents();

            // If no objects were found, returns nothing
            if (res.keyCount()==0){
                return;
            }

            // Stores the most recent two keys
            keys.add(objects.get(objects.size() - 1).key());

            if (res.keyCount() > 1){
                keys.add(objects.get(objects.size() - 2).key());
            }

            // If more than 1000 objects, cycles through the rest
            while (res.isTruncated()){
                // Gets the next batch
                listObjects = ListObjectsV2Request
                        .builder()
                        .bucket(bucketName)
                        .prefix("firehose/"+currentDateTime.getYear()+"/")
                        .continuationToken(res.nextContinuationToken())
                        .build();

                // Stores the batch
                res = s3.listObjectsV2(listObjects);
                objects = res.contents();

                // If there's more than one object, we store the most recent two keys
                // If there is only one object, we keep the latest key from the previous batch,
                // and store the most recent from this one
                if (res.keyCount() > 1){
                    keys.set(0, objects.get(objects.size() - 1).key());
                    keys.set(1, objects.get(objects.size() - 2).key());
                } else {
                    keys.set(1, objects.get(0).key());
                }
            }

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
                String line;

                while ((line = read.readLine()) != null) {
                    output.add(new JSONObject(line));
                }
            }

        } catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
