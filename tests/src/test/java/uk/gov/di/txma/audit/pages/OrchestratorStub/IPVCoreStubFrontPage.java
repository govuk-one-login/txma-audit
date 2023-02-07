package uk.gov.di.txma.audit.pages.OrchestratorStub;

import uk.gov.di.txma.audit.utilities.Driver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import java.net.MalformedURLException;

public class IPVCoreStubFrontPage {
    public IPVCoreStubFrontPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }
    @FindBy(xpath = "//*[@id='cri-link-ukPassport']")
    public WebElement UkPassport;

    @FindBy (xpath = "/html/body/div/main/div/div/dl[4]/div/dd/details/summary/span")
    public WebElement PassportCredential_attributes_link;

    @FindBy (xpath = "//div[@class='govuk-details__text']//pre")
    public WebElement PassportCRIJSONResponse;
}
