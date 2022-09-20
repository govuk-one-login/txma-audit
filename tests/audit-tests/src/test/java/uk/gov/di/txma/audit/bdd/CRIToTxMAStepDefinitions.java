package uk.gov.di.txma.audit.bdd;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import uk.gov.di.txma.audit.pages.IPVCoreStub.IPVCoreStubPage;
import uk.gov.di.txma.audit.pages.IPVCoreStub.VerifiableCredentialsPage;
import uk.gov.di.txma.audit.pages.IPVCoreStub.VisitCredentialIssuersPage;
import uk.gov.di.txma.audit.utilities.S3SearchHelper;
import uk.gov.di.txma.audit.utilities.BrowserUtils;
import uk.gov.di.txma.audit.utilities.ConfigurationReader;
import uk.gov.di.txma.audit.utilities.Driver;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class CRIToTxMAStepDefinitions {

    String sub = null;

    @Given("the user is on {string} CRI")
    public void openIPVCoreStubAndClickCRIPage(String CRI) {
        Driver.get().get(ConfigurationReader.getUrl("IPVCoreStubURL"));
        BrowserUtils.waitForPageToLoad(100);
        new IPVCoreStubPage().VisitCredentialIssuers.click();
        switch (CRI) {
            case "Address":
                new VisitCredentialIssuersPage().AddressCRIStaging.click();
                break;
            case "KBV":
                new VisitCredentialIssuersPage().KBVCRIStaging.click();
                break;
            default:
                System.out.println("CRI page not found");
        }
        BrowserUtils.waitForPageToLoad(100);
    }

    @Then("Response from CRI displays the subject identifier")
    public void getSubValueFromCRIPage() throws JsonProcessingException {
        new VerifiableCredentialsPage().ResponseFromCRI.click();
        String CRIJSONResponse = new VerifiableCredentialsPage().CRIJSONResponse.getText();

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(CRIJSONResponse);
        sub = jsonNode.get("sub").asText();
        Driver.get().quit();
    }

    @Then("the audit S3 should have a new event with the subject identifier and event_name {string}")
    public void searchS3ForSubAndEventName(String event_name) throws InterruptedException {
        assertTrue(S3SearchHelper.isStringFoundInS3(sub, event_name), "No event was found with user_id " + sub + " and event_name " + event_name);
    }
}
