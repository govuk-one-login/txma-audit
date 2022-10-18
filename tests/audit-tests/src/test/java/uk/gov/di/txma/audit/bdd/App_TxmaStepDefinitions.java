package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.Cookie;
import uk.gov.di.txma.audit.pages.App.DocCheckingPage;
import uk.gov.di.txma.audit.utilities.BrowserUtils;
import uk.gov.di.txma.audit.utilities.ConfigurationReader;
import uk.gov.di.txma.audit.utilities.Driver;
import uk.gov.di.txma.audit.utilities.S3SearchHelper;

import java.net.MalformedURLException;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class App_TxmaStepDefinitions {
    String sessionId=null;

    @Given("user is on APP API")
    public void userIsOnAPPAPI() throws MalformedURLException {
        Driver.get().get(ConfigurationReader.getAppURL());
        BrowserUtils.waitForPageToLoad(100);

    }

    @When("user clicks on continue")
    public void userClicksOnContinue() throws MalformedURLException {
        new DocCheckingPage().Continue.click();

    }

    @When("the user selects the session id")
    public void theUserSelectsTheSessionId() throws MalformedURLException {
        Set<Cookie> cookies = Driver.get().manage().getCookies();

        if (cookies != null) {
            for (
                    Cookie ck : cookies) {
                if (ck.getName().equals("sessionId")) {
                    System.out.println(ck.getName() + ";" + ck.getValue());
                }
            }
        }
        BrowserUtils.waitForPageToLoad(100);
        Driver.get().quit();
    }

    @Then("the audit S3 should have a new event with the user identifier subjectId")
    public void theAuditSShouldHaveANewEventWithTheUserIdentifierSubjectId() throws InterruptedException {
        assertTrue(S3SearchHelper.isStringFoundInS3(sessionId), "No event was found with user_id " + sessionId);


    }
}

