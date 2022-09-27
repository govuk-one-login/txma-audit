package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class FindYourAddressPage {
    public FindYourAddressPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "addressSearch")
    public WebElement EnterYourPostcode;

    @FindBy (id = "continue")
    public WebElement FindAddress;
}
