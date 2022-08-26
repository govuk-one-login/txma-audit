package uk.gov.di.txma.audit.bdd;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.Assert;
import org.openqa.selenium.support.ui.Select;
import pages.CheckYourAddressPage;
import pages.ChooseYourAddressPage;
import pages.ConfirmYourDetailsPage;
import pages.FindYourAddressPage;
import pages.IPVCoreStubPage;
import pages.VerifiableCredentialsPage;
import pages.VisitCredentialIssuersPage;
import utilities.BrowserUtils;
import utilities.ConfigurationReader;
import utilities.Driver;

public class AddressCRI_TxmaStepDefinitions {

    String KennethPostcode = "BA2 5AA";
    String KennethMoveYear = "2014";
    String KennethBuildingNumber = "8";
    String KennethStreetName = "HADLEY ROAD";
    String KennethAddressLocality = "BATH";
    String KennethAddressCountry = "GB";

    @Given("the user is on Address CRI")
    public void the_user_is_on_Address_CRI() {
        Driver.get().get(ConfigurationReader.getIPVCoreStubUrl());
        BrowserUtils.waitForPageToLoad(100);
        new IPVCoreStubPage().VisitCredentialIssuers.click();
        new VisitCredentialIssuersPage().AddressCRIIntegration.click();
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
        new VerifiableCredentialsPage().ResponseFromAddressCRIIntegration.click();
        String AddressCRIJSONResponse = new VerifiableCredentialsPage().AddressCRIJSONResponse.getText();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(AddressCRIJSONResponse);
        JsonNode vcNode = jsonNode.get("vc");
        JsonNode credentialSubject = vcNode.get("credentialSubject");
        JsonNode addressNode = credentialSubject.get("address");
        JsonNode addressDetails = addressNode.get(0);
        String buildingNumber = addressDetails.get("buildingNumber").asText();
        System.out.println("actualBuildingNumber = " + buildingNumber);
        System.out.println("KennethBuildingNumber = " + KennethBuildingNumber);
        String streetName = addressDetails.get("streetName").asText();
        System.out.println("actualStreetName = " + streetName);
        System.out.println("KennethStreetName = " + KennethStreetName);
        String addressLocality = addressDetails.get("addressLocality").asText();
        System.out.println("actualAddressLocality = " + addressLocality);
        System.out.println("KennethAddressLocality = " + KennethAddressLocality);
        String postalCode = addressDetails.get("postalCode").asText();
        System.out.println("actualPostalCode = " + postalCode);
        System.out.println("KennethPostcode = " + KennethPostcode);
        String addressCountry = addressDetails.get("addressCountry").asText();
        System.out.println("actualAddressCountry = " + addressCountry);
        System.out.println("KennethAddressCountry = " + KennethAddressCountry);
        Assert.assertEquals(KennethBuildingNumber, buildingNumber);
        Assert.assertEquals(KennethStreetName, streetName);
        Assert.assertEquals(KennethAddressLocality, addressLocality);
        Assert.assertEquals(KennethPostcode, postalCode);
        Assert.assertEquals(KennethAddressCountry, addressCountry);

    }
}


//import io.cucumber.java.en.Given;
//import io.cucumber.java.en.Then;
//import io.cucumber.java.en.When;
//import utilities.ConfigurationReader;
//import utilities.Driver;
//
//public class AddressCRI_TxmaStepDefinitions {
//    @Given("user is on Address CRI Staging")
//    public void user_is_on_address_cri_staging() {
//        Driver.get().get(ConfigurationReader.getIPVCoreStubUrl());
//
//    }
//    @When("user completes address journey successfully")
//    public void user_completes_address_journey_successfully() {
//        System.out.println("hello ..");
//    }
//    @Then("audit event should appear in TxMA")
//    public void audit_event_should_appear_in_tx_ma() {
//        System.out.println("hello ...");
//    }
//}
