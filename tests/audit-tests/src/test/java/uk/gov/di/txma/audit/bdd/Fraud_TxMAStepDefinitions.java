package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.And;
import io.cucumber.java.en.When;
import uk.gov.di.txma.audit.pages.Fraud.WeNeedToCheckYourDetailsPage;
import uk.gov.di.txma.audit.pages.KBV.ExperianUATUserSearchResultsPage;
import uk.gov.di.txma.audit.utilities.BrowserUtils;

import java.net.MalformedURLException;

public class Fraud_TxMAStepDefinitions {
    @When("the user clicks on `Go to Fraud CRI Staging`")
    public void the_user_clicks_on_Go_to_Fraud_CRI_Staging() throws MalformedURLException {
        new ExperianUATUserSearchResultsPage().GoToFraudCRIStaging.click();
        BrowserUtils.waitForPageToLoad(100);
    }

    @And("I navigate to the verifiable issuer to check for a Valid response from experian")
    public void navigateToVerifiableIssuer() throws MalformedURLException {
        new WeNeedToCheckYourDetailsPage().Checkdetails.click();
        BrowserUtils.waitForPageToLoad(100);

    }
}
