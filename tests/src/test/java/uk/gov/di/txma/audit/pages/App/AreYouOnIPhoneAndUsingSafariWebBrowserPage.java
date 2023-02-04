package uk.gov.di.txma.audit.pages.App;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;
public class AreYouOnIPhoneAndUsingSafariWebBrowserPage {

    public AreYouOnIPhoneAndUsingSafariWebBrowserPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(),this);
    }

    @FindBy(id="select-option-2")
    public WebElement AnswerNo;

    @FindBy(xpath= "//*[@id='form-tracking']/button")
    public WebElement Continue;
}
