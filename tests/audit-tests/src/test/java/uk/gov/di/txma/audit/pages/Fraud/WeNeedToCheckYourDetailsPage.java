package uk.gov.di.txma.audit.pages.Fraud;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class WeNeedToCheckYourDetailsPage {
    public WeNeedToCheckYourDetailsPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id="continue")
    public WebElement Checkdetails;
}
