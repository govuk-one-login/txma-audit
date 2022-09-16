package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class HowMuchOfYourLoanDoYouHaveLeftToPayBackPage {
    public HowMuchOfYourLoanDoYouHaveLeftToPayBackPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00039-UPTO6750-label")
    public WebElement UPTO6750;

    @FindBy(id = "Q00039-OVER6500UPTO6750-label")
    public WebElement OVER6500UPTO6750;

    @FindBy(id = "Q00039-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}