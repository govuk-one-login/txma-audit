package uk.gov.di.txma.audit.pages.IPVCoreStub;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class VisitCredentialIssuersPage {
    public VisitCredentialIssuersPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }
    @FindBy(xpath = "//input[@value='KBV CRI Staging']")
    public WebElement KBVCRIStaging;

    @FindBy(xpath = "//input[@value='Address CRI Staging']")
    public WebElement AddressCRIStaging;

    @FindBy(xpath = "//input[@value='Fraud CRI Staging']")
    public WebElement FraudCRIStaging;

}
