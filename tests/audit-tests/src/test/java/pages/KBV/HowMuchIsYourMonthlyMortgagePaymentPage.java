package pages.KBV;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class HowMuchIsYourMonthlyMortgagePaymentPage {
    public HowMuchIsYourMonthlyMortgagePaymentPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00018-OVER500UPTO600-label")
    public WebElement OVER500UPTO600;

    @FindBy(id = "Q00018-UPTO600-label")
    public WebElement UPTO600;

    @FindBy(id = "Q00018-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}