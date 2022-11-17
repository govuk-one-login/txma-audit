package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.Cookie;
import uk.gov.di.txma.audit.pages.AUTH.SampleServiceStagingPage;
import uk.gov.di.txma.audit.utilities.BrowserUtils;
import uk.gov.di.txma.audit.utilities.ConfigurationReader;
import uk.gov.di.txma.audit.utilities.Driver;
import uk.gov.di.txma.audit.utilities.S3SearchHelper;

import java.net.MalformedURLException;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class Auth_TxmaStepDefinitions {

    String persistent_session_id=null;
    @Given("user is on Auth API stub")
    public void userIsOnAuthAPIStub() throws MalformedURLException {
        Driver.get().get(ConfigurationReader.getAuthURL());
        BrowserUtils.waitForPageToLoad(100);
    }

    @When("user selects P2 as the Level of Confidence")
    public void userSelectsP2AsTheLevelOfConfidence() throws MalformedURLException {
        new SampleServiceStagingPage().Loc.click();
        new SampleServiceStagingPage().Continue.click();
    }

    @When("the user selects the persistent session id from the cookies")
    public void theUserSelectsThePersistentSessionIdFromTheCookies() throws MalformedURLException {
        Set<Cookie> cookies = Driver.get().manage().getCookies();

        if (cookies != null) {
            for (
                    Cookie ck : cookies) {
                if (ck.getName().equals("di-persistent-session-id")) {
                    System.out.println(ck.getName() + ";" + ck.getValue());
                    persistent_session_id=ck.getValue();
                }
            }
        }
        BrowserUtils.waitForPageToLoad(100);
        System.out.println(persistent_session_id);
        Driver.get().quit();
    }

    @Then("the audit S3 should have a new event with the user identifier persistent sessionId")
    public void theAuditS3ShouldHaveANewEventWithTheUserIdentifierPersistentSessionId() throws InterruptedException {
        System.out.println(persistent_session_id);
        assertTrue(S3SearchHelper.isStringFoundInS3(persistent_session_id), "No event was found with user_id " + persistent_session_id);



    }
}
