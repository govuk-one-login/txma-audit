package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import uk.gov.di.txma.audit.pages.App.AreYouOnIPhoneAndUsingSafariWebBrowserPage;
import uk.gov.di.txma.audit.pages.App.DocCheckingPage;
import uk.gov.di.txma.audit.utilities.BrowserUtils;

import java.net.MalformedURLException;

public class App_TxmaStepDefinitions {
    @Given("user is on APP API")
    public void userIsOnAPPAPI() throws MalformedURLException {
        new DocCheckingPage().Continue.click();

    }

    @When("user completes the journey successfully")
    public void userCompletesTheJourneySuccessfully() {
        new AreYouOnIPhoneAndUsingSafariWebBrowserPage().AnswerNo.click();
        new AreYouOnIPhoneAndUsingSafariWebBrowserPage().Continue.click();
        BrowserUtils.waitForPageToLoad(100);


    }
}
