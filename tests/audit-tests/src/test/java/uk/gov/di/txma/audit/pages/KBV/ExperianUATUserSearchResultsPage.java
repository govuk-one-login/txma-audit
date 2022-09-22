package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class ExperianUATUserSearchResultsPage {
    public ExperianUATUserSearchResultsPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//a[normalize-space()='Go to KBV CRI Staging']")
    public WebElement GoToKBVCRIStaging;

    @FindBy(xpath = "//a[normalize-space()='Go to Fraud CRI Staging']")
    public WebElement GoToFraudCRIStaging;

}