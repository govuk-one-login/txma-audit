package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.When;
import org.openqa.selenium.support.ui.Select;
import uk.gov.di.txma.audit.pages.Address.CheckYourAddressPage;
import uk.gov.di.txma.audit.pages.Address.ChooseYourAddressPage;
import uk.gov.di.txma.audit.pages.Address.ConfirmYourDetailsPage;
import uk.gov.di.txma.audit.pages.KBV.FindYourAddressPage;
import uk.gov.di.txma.audit.utilities.BrowserUtils;

import java.net.MalformedURLException;

public class AddressCRI_TxmaStepDefinitions {

    @When("the user enters their postcode and click `Find address`")
    public void the_user_enters_their_postcode_and_click_Find_address() throws MalformedURLException {
        new FindYourAddressPage().EnterYourPostcode.sendKeys("BA2 5AA");
        new FindYourAddressPage().FindAddress.click();
        BrowserUtils.waitForPageToLoad(100);
    }

    @When("the user chooses their address from dropdown and click `Choose address`")
    public void the_user_chooses_their_address_from_dropdown_and_click_Choose_address() throws MalformedURLException {
        Select select = new Select(new ChooseYourAddressPage().ChooseYourAddressFromTheList);
        select.selectByValue("8 HADLEY ROAD, BATH, BA2 5AA");
        new ChooseYourAddressPage().ChooseAddress.click();
        BrowserUtils.waitForPageToLoad(100);
    }

    @When("the user enters the date they moved into their current address")
    public void the_user_enters_the_date_they_moved_into_their_current_address() throws MalformedURLException {
        new CheckYourAddressPage().EnterTheYearYouStartedLivingAtThisAddress.sendKeys("2014");
        new CheckYourAddressPage().Continue.click();
        BrowserUtils.waitForPageToLoad(100);

    }

    @When("the user clicks `I confirm my details are correct`")
    public void the_user_clicks_I_confirm_my_details_are_correct() throws MalformedURLException {
        new ConfirmYourDetailsPage().IConfirmMyDetailsAreCorrect.click();
        BrowserUtils.waitForPageToLoad(100);
    }

}


