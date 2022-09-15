package pages.KBV;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class HowMuchDoYouHaveLeftToPayOnYourMortgagePage {
    public HowMuchDoYouHaveLeftToPayOnYourMortgagePage() {
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