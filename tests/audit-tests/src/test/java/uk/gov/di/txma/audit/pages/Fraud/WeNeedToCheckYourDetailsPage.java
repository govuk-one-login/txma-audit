package uk.gov.di.txma.audit.pages.Fraud;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class WeNeedToCheckYourDetailsPage {
    public WeNeedToCheckYourDetailsPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id="continue")
    public WebElement Checkdetails;
}
