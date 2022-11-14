package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class HowMuchOfYourLoanDoYouPayBackEveryMonthPage {
    public HowMuchOfYourLoanDoYouPayBackEveryMonthPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00042-OVER550UPTO600-label")
    public WebElement OVER550UPTO600;

    @FindBy(id = "Q00042-UPTO600-label")
    public WebElement UPTO600;

    @FindBy(id = "Q00042-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}
