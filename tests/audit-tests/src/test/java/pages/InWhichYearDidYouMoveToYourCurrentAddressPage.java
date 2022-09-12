package pages;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class InWhichYearDidYouMoveToYourCurrentAddressPage {
    public InWhichYearDidYouMoveToYourCurrentAddressPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00002-2002-label")
    public WebElement Year2002;

    @FindBy(id = "Q00002-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}