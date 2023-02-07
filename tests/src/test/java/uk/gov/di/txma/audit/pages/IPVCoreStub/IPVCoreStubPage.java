package uk.gov.di.txma.audit.pages.IPVCoreStub;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class IPVCoreStubPage {
    public IPVCoreStubPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(),this);
    }
    @FindBy(xpath = "//button[@class='govuk-button']")
    public WebElement VisitCredentialIssuers;
}
