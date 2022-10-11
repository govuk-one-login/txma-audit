package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.Given;
import uk.gov.di.txma.audit.pages.App.DocCheckingPage;

import java.net.MalformedURLException;

public class App_TxmaStepDefinitions {
    @Given("user is on APP API")
    public void userIsOnAPPAPI() throws MalformedURLException {
        new DocCheckingPage().Continue.click();

    }
}
