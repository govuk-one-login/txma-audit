package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class FindYourAddressPage {
    public FindYourAddressPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "addressSearch")
    public WebElement EnterYourPostcode;

    @FindBy (id = "continue")
    public WebElement FindAddress;
}
