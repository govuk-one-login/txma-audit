package uk.gov.di.txma.audit.pages.IPVCoreStub;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class VisitCredentialIssuersPage {
    public VisitCredentialIssuersPage() {
        PageFactory.initElements(Driver.get(), this);
    }
    @FindBy(xpath = "//input[@value='KBV CRI Staging']")
    public WebElement KBVCRIStaging;

    @FindBy(xpath = "//input[@value='Address CRI Staging']")
    public WebElement AddressCRIStaging;

    @FindBy(xpath = "//input[@value='Fraud CRI Staging']")
    public WebElement FraudCRIStaging;

    @FindBy(xpath = "//input[@value='Passport CRI Staging']")
    public WebElement PassportCRIStaging;

}
