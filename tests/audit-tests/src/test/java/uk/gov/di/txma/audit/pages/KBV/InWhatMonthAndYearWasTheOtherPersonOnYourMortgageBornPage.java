package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage {
    public InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00020-021963-label")
    public WebElement February1963;

    @FindBy(xpath = "//label[@id='Q00020-NONEOFTHEABOVEDOESNOTAPPLY-label']")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(xpath = "//button[@id='continue']")
    public WebElement Continue;
}