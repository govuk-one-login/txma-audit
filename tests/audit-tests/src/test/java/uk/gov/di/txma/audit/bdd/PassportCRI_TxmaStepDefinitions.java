package uk.gov.di.txma.audit.bdd;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.json.JSONObject;
import software.amazon.awssdk.regions.Region;
import uk.gov.di.txma.audit.utilities.BrowserUtils;
import uk.gov.di.txma.audit.utilities.ConfigurationReader;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;

import uk.gov.di.txma.audit.pages.Passport.PassportPage;
import uk.gov.di.txma.audit.pages.IPVCoreStub.VerifiableCredentialsPage;
import uk.gov.di.txma.audit.pages.OrchestratorStub.IPVCoreStubFrontPage;
import uk.gov.di.txma.audit.pages.OrchestratorStub.OrchestratorStubPage;
import uk.gov.di.txma.audit.utilities.S3SearchHelper;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PassportCRI_TxmaStepDefinitions {
    String userId = null;
    @Given("user is on Passport CRI staging")
    public void navigateToPassportCriURL() throws MalformedURLException {
        Driver.get().get(ConfigurationReader.getOrchestratorStubUrl());
        BrowserUtils.waitForPageToLoad(10);
        new OrchestratorStubPage().DebugRoute.click();
        BrowserUtils.waitForPageToLoad(10);
        new IPVCoreStubFrontPage().UkPassport.click();
        BrowserUtils.waitForPageToLoad(10);
    }

    @When("user completes address journey successfully")
    public void enterPassportDetails() throws JsonProcessingException, MalformedURLException {

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
        new IPVCoreStubFrontPage().PassportCredential_attributes_link.click();
        String PassportCRIJSONResponse = new IPVCoreStubFrontPage().PassportCRIJSONResponse.getText();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(PassportCRIJSONResponse);
        userId = jsonNode.get("userId").asText();
        Driver.get().quit();
    }

    @Then("the audit S3 should have a new event with the user identifier and event_name {string}")
    public void searchS3ForSubAndEventName(String event_name) throws InterruptedException {
        assertTrue(S3SearchHelper.isStringFoundInS3(userId, event_name), "No event was found with user_id " + userId + " and event_name " + event_name);
    }
}