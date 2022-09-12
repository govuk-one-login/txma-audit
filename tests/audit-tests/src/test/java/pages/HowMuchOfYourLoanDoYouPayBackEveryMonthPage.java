package pages;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class HowMuchOfYourLoanDoYouPayBackEveryMonthPage {
    public HowMuchOfYourLoanDoYouPayBackEveryMonthPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00042-OVER550UPTO600-label")
    public WebElement OVER550UPTO600;

    @FindBy(id = "Q00042-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}