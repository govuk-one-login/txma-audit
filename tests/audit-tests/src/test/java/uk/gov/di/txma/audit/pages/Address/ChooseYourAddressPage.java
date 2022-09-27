package uk.gov.di.txma.audit.pages.Address;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class ChooseYourAddressPage {
    public ChooseYourAddressPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(),this);
    }
    @FindBy(id = "addressResults")
    public WebElement ChooseYourAddressFromTheList;

    @FindBy (id = "continue")
    public WebElement ChooseAddress;
}
