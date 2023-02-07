package uk.gov.di.txma.audit.pages.AUTH;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class SampleServiceStagingPage {

    public SampleServiceStagingPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(),this);
    }

    @FindBy(id="loc-P2")
    public WebElement Loc;

    @FindBy(id= "govuk-signin-button")
    public WebElement Continue;
}
