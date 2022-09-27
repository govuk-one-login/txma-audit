package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class HowMuchDoYouHaveLeftToPayOnYourMortgagePage {
    public HowMuchDoYouHaveLeftToPayOnYourMortgagePage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00015-OVER35000UPTO60000-label")
    public WebElement OVER35000UPTO60000;

    @FindBy(id = "Q00015-UPTO60000-label")
    public WebElement UPTO60000;

    @FindBy(id = "Q00015-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}