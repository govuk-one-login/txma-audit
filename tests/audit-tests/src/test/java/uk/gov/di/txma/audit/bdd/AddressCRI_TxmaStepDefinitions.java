package uk.gov.di.txma.audit.bdd;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.json.JSONObject;
import org.openqa.selenium.support.ui.Select;
import pages.CheckYourAddressPage;
import pages.ChooseYourAddressPage;
import pages.ConfirmYourDetailsPage;
import pages.KBV.FindYourAddressPage;
import pages.IPVCoreStubPage;
import pages.VerifiableCredentialsPage;
import pages.VisitCredentialIssuersPage;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;
import utilities.BrowserUtils;
import utilities.ConfigurationReader;
import utilities.Driver;
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

public class AddressCRI_TxmaStepDefinitions {

    String KennethPostcode = "BA2 5AA";
    String KennethMoveYear = "2014";
    List<JSONObject> output = new ArrayList<>();
    Region region = Region.EU_WEST_2;
    String sub = null;


    @Given("the user is on Address CRI")
    public void the_user_is_on_Address_CRI() {
        Driver.get().get(ConfigurationReader.getIPVCoreStubUrl());
        BrowserUtils.waitForPageToLoad(100);
        new IPVCoreStubPage().VisitCredentialIssuers.click();
        new VisitCredentialIssuersPage().AddressCRIStaging.click();
        BrowserUtils.waitForPageToLoad(100);

    }
    @When("the user enters their postcode and click `Find address`")
    public void the_user_enters_their_postcode_and_click_Find_address() {
        new FindYourAddressPage().EnterYourPostcode.sendKeys(KennethPostcode);
        new FindYourAddressPage().FindAddress.click();
        BrowserUtils.waitForPageToLoad(100);
    }

    @When("the user chooses their address from dropdown and click `Choose address`")
    public void the_user_chooses_their_address_from_dropdown_and_click_Choose_address() {
        Select select = new Select(new ChooseYourAddressPage().ChooseYourAddressFromTheList);
        select.selectByValue("8 HADLEY ROAD, BATH, BA2 5AA");
        new ChooseYourAddressPage().ChooseAddress.click();
        BrowserUtils.waitForPageToLoad(100);
    }

    @When("the user enters the date they moved into their current address")
    public void the_user_enters_the_date_they_moved_into_their_current_address() {
        new CheckYourAddressPage().EnterTheYearYouStartedLivingAtThisAddress.sendKeys(KennethMoveYear);
        new CheckYourAddressPage().Continue.click();
        BrowserUtils.waitForPageToLoad(100);

    }
    @When("the user clicks `I confirm my details are correct`")
    public void the_user_clicks_I_confirm_my_details_are_correct() {
        new ConfirmYourDetailsPage().IConfirmMyDetailsAreCorrect.click();
        BrowserUtils.waitForPageToLoad(100);
    }

    @Then("Response from Address CRI Integration displays the user's address in JSON")
    public void response_from_Address_CRI_Integration_displays_the_user_s_address_in_JSON() throws JsonProcessingException {
//        new VerifiableCredentialsPage().ResponseFromAddressCRIIntegration.click();
        String AddressCRIJSONResponse = new VerifiableCredentialsPage().AddressCRIJSONResponse.getText();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(AddressCRIJSONResponse);
        sub = jsonNode.get("sub").asText();
    }

    @Then("the audit S3 should have a new event with the postcode provided")
    public void the_Audit_S3_Should_Have_A_New_Event_With_The_Postcode_Provided() throws InterruptedException {
        assertTrue(isFoundInS3());
    }

    @When("the user clicks on summaryTest and reads the sub value from JSON")
    public void the_User_Clicks_On_Summary_Test_And_Reads_The_Sub_Value_From_JSON() {
        new VerifiableCredentialsPage().ResponseFromAddressCRIDev.click();
        Driver.get().quit();

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


}


