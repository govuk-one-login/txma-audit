package uk.gov.di.txma.audit.pages.IPVCoreStub;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class VerifiableCredentialsPage {
    public VerifiableCredentialsPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy (xpath = "//span[@class='govuk-details__summary-text']")
    public WebElement ResponseFromCRI;

    @FindBy (xpath = "//div[@class='govuk-details__text']//pre")
    public WebElement CRIJSONResponse;

}